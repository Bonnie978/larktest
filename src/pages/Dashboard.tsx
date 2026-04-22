import { useState, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import ChartCard from '@/components/dashboard/ChartCard';
import ChartBuilder from '@/components/dashboard/ChartBuilder';
import { loadCharts, saveCharts } from '@/utils/storage';
import type { ChartConfig, CardConfig, DataSourceType, DataSourceMeta } from '@/types/dashboard';
import { useRequest } from '@/hooks/useRequest';
import { getDataSources } from '@/api';

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

/** Convert ChartConfig (Dashboard type) → CardConfig (ChartBuilder type) */
function chartConfigToCardConfig(chart: ChartConfig): CardConfig {
  return {
    id: chart.id,
    title: chart.title,
    dataSourceId: chart.dataSource,
    chartType: chart.chartType,
    groupByField: chart.dimension,
    valueFields: chart.metrics,
    aggregation: chart.aggregation,
  };
}

/** Convert CardConfig (ChartBuilder output) → ChartConfig (Dashboard type) */
function cardConfigToChartConfig(card: CardConfig, existingLayout?: ChartConfig['layout']): ChartConfig {
  return {
    id: card.id,
    title: card.title,
    dataSource: card.dataSourceId as DataSourceType,
    dimension: card.groupByField,
    metrics: card.valueFields,
    aggregation: card.aggregation,
    chartType: card.chartType,
    layout: existingLayout ?? { x: 0, y: Infinity, w: 4, h: 3 },
  };
}

export default function Dashboard() {
  const [charts, setCharts] = useState<ChartConfig[]>(() => {
    const loaded = loadCharts();
    return loaded.length > 0 ? loaded : getDefaultCharts();
  });
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | undefined>(undefined);

  const { data: dataSources } = useRequest<DataSourceMeta[]>(getDataSources);

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

  const handleOpenAddChart = useCallback(() => {
    setEditingChart(undefined);
    setBuilderOpen(true);
  }, []);

  const handleOpenEditChart = useCallback((chart: ChartConfig) => {
    setEditingChart(chart);
    setBuilderOpen(true);
  }, []);

  const handleBuilderConfirm = useCallback((cardConfig: CardConfig) => {
    setCharts(prev => {
      const existingIndex = prev.findIndex(c => c.id === cardConfig.id);
      let updated: ChartConfig[];
      if (existingIndex >= 0) {
        // Editing existing chart: preserve layout
        const existingLayout = prev[existingIndex].layout;
        updated = prev.map((c, idx) =>
          idx === existingIndex ? cardConfigToChartConfig(cardConfig, existingLayout) : c
        );
      } else {
        // Adding new chart
        updated = [...prev, cardConfigToChartConfig(cardConfig)];
      }
      saveCharts(updated);
      return updated;
    });
    setBuilderOpen(false);
    setEditingChart(undefined);
  }, []);

  const handleBuilderCancel = useCallback(() => {
    setBuilderOpen(false);
    setEditingChart(undefined);
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
            <Button size="sm" variant="outline" onClick={handleOpenAddChart}>
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
                  onEdit={() => handleOpenEditChart(chart)}
                  onRemove={() => handleRemoveChart(chart.id)}
                />
              </div>
            ))}
          </GridLayout>
        </div>
      )}

      {/* Chart Builder Dialog */}
      <ChartBuilder
        open={builderOpen}
        editingConfig={editingChart ? chartConfigToCardConfig(editingChart) : undefined}
        dataSources={dataSources ?? []}
        onConfirm={handleBuilderConfirm}
        onCancel={handleBuilderCancel}
      />
    </div>
  );
}
