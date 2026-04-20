import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import ChartCard from '@/components/dashboard/ChartCard';
import AddChartDialog from '@/components/dashboard/AddChartDialog';
import { loadCharts, saveCharts } from '@/utils/storage';
import type { ChartConfig } from '@/types/dashboard';

const getDefaultCharts = (): ChartConfig[] => [
  {
    id: 'default-1',
    title: '产线产量完成情况',
    dataSource: 'line-production',
    dimension: 'lineName',
    metrics: ['planned', 'actual'],
    aggregation: 'sum',
    chartType: 'bar',
    layout: { x: 0, y: 0, w: 6, h: 4 },
  },
  {
    id: 'default-2',
    title: '近7天不良率趋势',
    dataSource: 'quality-defects',
    dimension: 'lineName',
    metrics: ['defectCount'],
    aggregation: 'sum',
    chartType: 'line',
    layout: { x: 6, y: 0, w: 6, h: 4 },
  },
  {
    id: 'default-3',
    title: '设备OEE排行',
    dataSource: 'equipment-oee',
    dimension: 'name',
    metrics: ['oee'],
    aggregation: 'avg',
    chartType: 'bar',
    layout: { x: 0, y: 4, w: 6, h: 4 },
  },
];

export default function DashboardEditor() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [tempCharts, setTempCharts] = useState<ChartConfig[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [GridLayout, setGridLayout] = useState<any>(null);

  useEffect(() => {
    const loaded = loadCharts();
    const initial = loaded.length > 0 ? loaded : getDefaultCharts();
    setCharts(initial);
    setTempCharts(initial);
  }, []);

  useEffect(() => {
    import('react-grid-layout').then((mod) => {
      setGridLayout(() => mod.default);
    });
  }, []);

  const handleToggleEditMode = () => {
    if (isEditMode) {
      setTempCharts(charts);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = () => {
    setCharts(tempCharts);
    saveCharts(tempCharts);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setTempCharts(charts);
    setIsEditMode(false);
  };

  const handleResetDefault = () => {
    const defaults = getDefaultCharts();
    setTempCharts(defaults);
  };

  const handleAddChart = (config: ChartConfig) => {
    setTempCharts([...tempCharts, config]);
  };

  const handleDeleteChart = (id: string) => {
    setTempCharts(tempCharts.filter((c) => c.id !== id));
  };

  const handleLayoutChange = useCallback((layout: any) => {
    const arr = Array.isArray(layout) ? layout : [];
    setTempCharts((prev) =>
      prev.map((chart) => {
        const g = arr.find((l: any) => l.i === chart.id);
        return g
          ? { ...chart, layout: { x: g.x, y: g.y, w: g.w, h: g.h } }
          : chart;
      }),
    );
  }, []);

  const displayCharts = isEditMode ? tempCharts : charts;

  const renderToolbar = () => {
    if (!isEditMode) {
      return (
        <Button onClick={handleToggleEditMode} variant="outline" size="sm">
          编辑看板
        </Button>
      );
    }
    return (
      <div className="flex gap-2">
        <Button onClick={() => setShowAddDialog(true)} variant="outline" size="sm">
          新增图表
        </Button>
        <Button onClick={handleResetDefault} variant="outline" size="sm">
          恢复默认
        </Button>
        <Button onClick={handleCancel} variant="outline" size="sm">
          取消
        </Button>
        <Button onClick={handleSave} size="sm">
          保存
        </Button>
      </div>
    );
  };

  if (!GridLayout) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">自定义看板</h2>
          {renderToolbar()}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {displayCharts.map((chart) => (
            <div key={chart.id} style={{ minHeight: 320 }}>
              <ChartCard
                config={chart}
                editable={isEditMode}
                onRemove={() => handleDeleteChart(chart.id)}
              />
            </div>
          ))}
        </div>
        <AddChartDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAddChart}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">自定义看板</h2>
        {renderToolbar()}
      </div>
      <div style={{ width: '100%' }}>
        <GridLayout
          className="layout"
          layout={displayCharts.map((c) => ({
            i: c.id,
            ...c.layout,
          }))}
          cols={12}
          rowHeight={80}
          width={1200}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
        >
          {displayCharts.map((chart) => (
            <div key={chart.id}>
              <ChartCard
                config={chart}
                editable={isEditMode}
                onRemove={() => handleDeleteChart(chart.id)}
              />
            </div>
          ))}
        </GridLayout>
      </div>
      <AddChartDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddChart}
      />
    </div>
  );
}
