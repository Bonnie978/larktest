import { useState, useCallback, useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { verticalCompactor } from 'react-grid-layout/core';
import { Button } from '@/components/ui/button';
import ChartCard from '@/components/dashboard/ChartCard';
import AddChartDialog from '@/components/dashboard/AddChartDialog';
import { loadCharts, saveCharts, clearCharts } from '@/utils/storage';
import type { ChartConfig } from '@/types/dashboard';
import type { Layout, LayoutItem } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';

export default function Dashboard() {
  const [charts, setCharts] = useState<ChartConfig[]>(() => loadCharts());
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const { width, containerRef } = useContainerWidth();

  const isEdit = mode === 'edit';

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      setCharts(prev => {
        const updated = prev.map(chart => {
          const layoutItem = newLayout.find((l: LayoutItem) => l.i === chart.id);
          if (layoutItem) {
            return {
              ...chart,
              layout: {
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              },
            };
          }
          return chart;
        });
        saveCharts(updated);
        return updated;
      });
    },
    [],
  );

  const handleAddChart = useCallback((config: ChartConfig) => {
    setCharts(prev => {
      const updated = [...prev, config];
      saveCharts(updated);
      return updated;
    });
  }, []);

  const handleUpdateChart = useCallback((config: ChartConfig) => {
    setCharts(prev => {
      const updated = prev.map(c => c.id === config.id ? config : c);
      saveCharts(updated);
      return updated;
    });
  }, []);

  const handleRemoveChart = useCallback((id: string) => {
    setCharts(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveCharts(updated);
      return updated;
    });
  }, []);

  const handleEditChart = useCallback((chart: ChartConfig) => {
    setEditingChart(chart);
    setShowAddDialog(true);
  }, []);

  const handleResetDefault = useCallback(() => {
    if (confirm('确定要恢复默认看板吗？当前配置将被清除。')) {
      clearCharts();
      setCharts([]);
    }
  }, []);

  const layouts = useMemo(() => ({
    lg: charts.map(c => ({
      i: c.id,
      x: c.layout.x,
      y: c.layout.y,
      w: c.layout.w,
      h: c.layout.h,
      minW: 2,
      minH: 2,
    })),
  }), [charts]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">可视化仪表盘</h1>
        <div className="flex items-center gap-2">
          {isEdit && (
            <>
              <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                添加图表
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetDefault}>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                恢复默认
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant={isEdit ? 'default' : 'outline'}
            onClick={() => setMode(isEdit ? 'view' : 'edit')}
          >
            {isEdit ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                完成编辑
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑看板
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {charts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="text-sm mb-3">尚未添加任何图表</p>
          <Button size="sm" onClick={() => { setMode('edit'); setShowAddDialog(true); }}>
            添加第一个图表
          </Button>
        </div>
      )}

      {/* Grid Layout */}
      <div ref={containerRef}>
        {charts.length > 0 && width > 0 && (
          <ResponsiveGridLayout
            className="layout"
            width={width}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={80}
            margin={[16, 16]}
            compactor={verticalCompactor}
            dragConfig={{ enabled: isEdit, bounded: false, cancel: '.no-drag', threshold: 3 }}
            resizeConfig={{ enabled: isEdit, handles: ['se'] }}
            onLayoutChange={handleLayoutChange}
          >
            {charts.map(chart => (
              <div key={chart.id}>
                <ChartCard
                  config={chart}
                  editable={isEdit}
                  onRemove={() => handleRemoveChart(chart.id)}
                  onEdit={() => handleEditChart(chart)}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>

      {/* Add/Edit Chart Dialog */}
      <AddChartDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingChart(null);
        }}
        onAdd={editingChart ? handleUpdateChart : handleAddChart}
        editingChart={editingChart}
      />
    </div>
  );
}
