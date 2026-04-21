import { useState, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import ChartCard from '@/components/dashboard/ChartCard';
import AddChartDialog from '@/components/dashboard/AddChartDialog';
import { loadCharts, saveCharts } from '@/utils/storage';
import type { ChartConfig } from '@/types/dashboard';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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
    title: '设备OEE趋势',
    dataSource: 'equipment-oee',
    dimension: 'date',
    metrics: ['oee'],
    aggregation: 'avg',
    chartType: 'line',
    layout: { x: 6, y: 0, w: 6, h: 4 },
  },
  {
    id: 'default-3',
    title: '质量缺陷分布',
    dataSource: 'quality-defects',
    dimension: 'defectType',
    metrics: ['count'],
    aggregation: 'sum',
    chartType: 'pie',
    layout: { x: 0, y: 4, w: 6, h: 4 },
  },
];

export default function Dashboard() {
  const [charts, setCharts] = useState<ChartConfig[]>(() => {
    const loaded = loadCharts();
    return loaded.length > 0 ? loaded : getDefaultCharts();
  });
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isEdit = mode === 'edit';

  const handleLayoutChange = useCallback(
    (newLayout: any) => {
      if (!isEdit) return;
      const layoutArray = Array.isArray(newLayout) ? newLayout : [];
      setCharts(prev => {
        const updated = prev.map(chart => {
          const layoutItem = layoutArray.find((l: any) => l.i === chart.id);
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
    [isEdit],
  );

  const handleAddChart = useCallback((config: ChartConfig) => {
    setCharts(prev => {
      const updated = [...prev, config];
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

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">可视化仪表盘</h1>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              添加图表
            </Button>
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

      {/* Grid Layout */}
      {charts.length > 0 && (
        <div style={{ width: '100%' }}>
          <GridLayout
            width={1200}
            gridConfig={{
              cols: 12,
              rowHeight: 80,
              margin: [16, 16],
              containerPadding: null,
              maxRows: Infinity,
            }}
            dragConfig={{
              enabled: isEdit,
            }}
            resizeConfig={{
              enabled: isEdit,
            }}
            onLayoutChange={handleLayoutChange}
          >
            {charts.map(chart => (
              <div
                key={chart.id}
                data-grid={{
                  x: chart.layout.x,
                  y: chart.layout.y,
                  w: chart.layout.w,
                  h: chart.layout.h,
                  minW: 2,
                  minH: 2,
                }}
              >
                <ChartCard
                  config={chart}
                  editable={isEdit}
                  onRemove={() => handleRemoveChart(chart.id)}
                />
              </div>
            ))}
          </GridLayout>
        </div>
      )}

      {/* Add Chart Dialog */}
      <AddChartDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddChart}
      />
    </div>
  );
}
