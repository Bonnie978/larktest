import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ChartCard from '@/components/dashboard/ChartCard';
import ChartBuilder from '@/components/dashboard/ChartBuilder';
import { loadCharts, saveCharts, validateChartConfig } from '@/utils/storage';
import type { ChartConfig } from '@/types/dashboard';

import 'react-grid-layout/css/styles.css';

export default function Dashboard() {
  const [charts, setCharts] = useState<ChartConfig[]>(() => loadCharts());
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [GridLayout, setGridLayout] = useState<any>(null);

  useEffect(() => {
    import('react-grid-layout').then((mod) => {
      setGridLayout(() => mod.default);
    });
  }, []);

  const isEdit = mode === 'edit';

  const editingChart = useMemo(
    () => charts.find(chart => chart.id === editingChartId),
    [charts, editingChartId],
  );

  const openCreate = useCallback(() => {
    setEditingChartId(null);
    setBuilderOpen(true);
  }, []);

  const openEdit = useCallback((id: string) => {
    setEditingChartId(id);
    setBuilderOpen(true);
  }, []);

  const closeBuilder = useCallback(() => {
    setBuilderOpen(false);
    setEditingChartId(null);
  }, []);

  const upsertChart = useCallback((config: ChartConfig) => {
    if (!validateChartConfig(config)) {
      return;
    }

    setCharts(prev => {
      const exists = prev.some(chart => chart.id === config.id);
      const updated = exists
        ? prev.map(chart => (chart.id === config.id ? config : chart))
        : [...prev, config];
      saveCharts(updated);
      return updated;
    });

    closeBuilder();
  }, [closeBuilder]);

  const handleRemoveChart = useCallback((id: string) => {
    setCharts(prev => {
      const updated = prev.filter(chart => chart.id !== id);
      saveCharts(updated);
      return updated;
    });
  }, []);

  const handleLayoutChange = useCallback((layout: any) => {
    const layoutItems = Array.isArray(layout) ? layout : [];
    setCharts(prev => {
      const updated = prev.map(chart => {
        const item = layoutItems.find((entry: any) => entry.i === chart.id);
        if (!item) return chart;
        return {
          ...chart,
          layout: {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          },
        };
      });
      saveCharts(updated);
      return updated;
    });
  }, []);

  const renderChart = (chart: ChartConfig) => (
    <ChartCard
      config={chart}
      editable={isEdit}
      onEdit={() => openEdit(chart.id)}
      onRemove={() => handleRemoveChart(chart.id)}
    />
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">可视化仪表盘</h1>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button size="sm" variant="outline" onClick={openCreate}>
              添加图表
            </Button>
          )}
          <Button
            size="sm"
            variant={isEdit ? 'default' : 'outline'}
            onClick={() => setMode(isEdit ? 'view' : 'edit')}
          >
            {isEdit ? '完成编辑' : '编辑看板'}
          </Button>
        </div>
      </div>

      {charts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <p className="text-sm mb-3">尚未添加任何图表</p>
          <Button size="sm" onClick={() => { setMode('edit'); openCreate(); }}>
            添加第一个图表
          </Button>
        </div>
      )}

      {!GridLayout && charts.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {charts.map(chart => (
            <div key={chart.id} style={{ minHeight: 320 }}>
              {renderChart(chart)}
            </div>
          ))}
        </div>
      )}

      {GridLayout && charts.length > 0 && (
        <div style={{ width: '100%' }}>
          <GridLayout
            className="layout"
            layout={charts.map(chart => ({ i: chart.id, ...chart.layout }))}
            cols={12}
            rowHeight={80}
            width={1200}
            isDraggable={isEdit}
            isResizable={isEdit}
            onLayoutChange={handleLayoutChange}
            draggableCancel=".no-drag"
          >
            {charts.map(chart => (
              <div key={chart.id}>{renderChart(chart)}</div>
            ))}
          </GridLayout>
        </div>
      )}

      <ChartBuilder
        open={builderOpen}
        editingConfig={editingChart}
        onConfirm={upsertChart}
        onCancel={closeBuilder}
      />
    </div>
  );
}
