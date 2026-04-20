import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ChartConfig, DataSourceMeta } from '@/types/dashboard';
import ChartBuilder from './dashboard/ChartBuilder';
import SimpleChart from './dashboard/SimpleChart';
import { DataAggregator } from '@/utils/aggregator';
import { loadCharts, saveCharts } from '@/utils/storage';
import { getDataSources, getDataSourceData } from '@/api';

const aggregator = new DataAggregator();

interface GridLayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardCard {
  config: ChartConfig;
  grid: GridLayoutItem;
}

const getDefaultCards = (): DashboardCard[] => [
  {
    config: {
      id: 'default-1',
      title: '产线产量完成情况',
      dataSource: 'line-production',
      chartType: 'bar',
      dimension: 'lineName',
      metrics: ['planned', 'actual'],
      aggregation: 'sum',
      layout: { x: 0, y: 0, w: 6, h: 4 },
    },
    grid: { x: 0, y: 0, w: 6, h: 4 },
  },
  {
    config: {
      id: 'default-2',
      title: '设备OEE概览',
      dataSource: 'equipment-oee',
      chartType: 'bar',
      dimension: 'name',
      metrics: ['oee'],
      aggregation: 'avg',
      layout: { x: 6, y: 0, w: 6, h: 4 },
    },
    grid: { x: 6, y: 0, w: 6, h: 4 },
  },
  {
    config: {
      id: 'default-3',
      title: '质量不良分布',
      dataSource: 'quality-defects',
      chartType: 'pie',
      dimension: 'defectType',
      metrics: ['defectCount'],
      aggregation: 'sum',
      layout: { x: 0, y: 4, w: 6, h: 4 },
    },
    grid: { x: 0, y: 4, w: 6, h: 4 },
  },
];

function configsToDashboardCards(configs: ChartConfig[]): DashboardCard[] {
  return configs.map((c) => ({
    config: c,
    grid: { x: c.layout.x, y: c.layout.y, w: c.layout.w, h: c.layout.h },
  }));
}

function dashboardCardsToConfigs(cards: DashboardCard[]): ChartConfig[] {
  return cards.map((c) => ({
    ...c.config,
    layout: c.grid,
  }));
}

// Build DataSourceMeta[] for ChartBuilder from API data or local fallback
function buildDataSourceMeta(rawSources: any[]): DataSourceMeta[] {
  return rawSources.map((ds) => ({
    id: ds.id,
    name: ds.name ?? ds.id,
    fields: (ds.fields ?? []).map((f: any) => ({
      name: f.name ?? f.field,
      label: f.label,
      type: f.type ?? 'string',
    })),
  }));
}

// Fallback static source meta when API is unavailable
const FALLBACK_SOURCES: DataSourceMeta[] = [
  {
    id: 'line-production',
    name: '产线产量',
    fields: [
      { name: 'lineName', label: '产线名称', type: 'string' },
      { name: 'shift', label: '班次', type: 'string' },
      { name: 'planned', label: '计划产量', type: 'number' },
      { name: 'actual', label: '实际产量', type: 'number' },
      { name: 'completionRate', label: '完成率', type: 'number' },
    ],
  },
  {
    id: 'equipment-oee',
    name: '设备OEE',
    fields: [
      { name: 'name', label: '设备名称', type: 'string' },
      { name: 'lineName', label: '所属产线', type: 'string' },
      { name: 'oee', label: 'OEE', type: 'number' },
      { name: 'availability', label: '可用率', type: 'number' },
      { name: 'performance', label: '性能率', type: 'number' },
      { name: 'quality', label: '质量率', type: 'number' },
    ],
  },
  {
    id: 'quality-defects',
    name: '质量不良',
    fields: [
      { name: 'lineName', label: '产线名称', type: 'string' },
      { name: 'defectType', label: '不良类型', type: 'string' },
      { name: 'defectCount', label: '不良数量', type: 'number' },
    ],
  },
  {
    id: 'order-delivery',
    name: '工单交付',
    fields: [
      { name: 'productModel', label: '产品型号', type: 'string' },
      { name: 'deliveryStatus', label: '交付状态', type: 'string' },
      { name: 'plannedQty', label: '计划数量', type: 'number' },
      { name: 'completedQty', label: '完成数量', type: 'number' },
    ],
  },
  {
    id: 'shift-output',
    name: '班次产量',
    fields: [
      { name: 'lineName', label: '产线名称', type: 'string' },
      { name: 'shift', label: '班次', type: 'string' },
      { name: 'actual', label: '实际产量', type: 'number' },
      { name: 'planned', label: '计划产量', type: 'number' },
    ],
  },
];

// Chart rendering wrapper: load data & aggregate for each card
function ChartCardContent({ config }: { config: ChartConfig }) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    getDataSourceData(config.dataSource)
      .then((raw) => {
        const aggregated = aggregator.aggregate(raw, config);
        setChartData(aggregated);
      })
      .catch(() => setChartData([]));
  }, [config.dataSource, config.dimension, config.metrics.join(','), config.aggregation]);

  return <SimpleChart data={chartData} chartType={config.chartType} />;
}

export default function DashboardEditor() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [tempCards, setTempCards] = useState<DashboardCard[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceMeta[]>(FALLBACK_SOURCES);

  // ChartBuilder state
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ChartConfig | undefined>(undefined);

  // Dynamically import react-grid-layout to avoid TS module issues
  const [GridLayout, setGridLayout] = useState<any>(null);

  useEffect(() => {
    const saved = loadCharts();
    const loaded: DashboardCard[] = saved.length > 0
      ? configsToDashboardCards(saved)
      : getDefaultCards();
    setCards(loaded);
    setTempCards(loaded);
  }, []);

  useEffect(() => {
    import('react-grid-layout').then((mod) => {
      setGridLayout(() => mod.default);
    });
  }, []);

  // Load data source metadata from API
  useEffect(() => {
    getDataSources()
      .then((sources) => {
        if (Array.isArray(sources) && sources.length > 0) {
          setDataSources(buildDataSourceMeta(sources));
        }
      })
      .catch(() => {
        // Use fallback
      });
  }, []);

  const handleToggleEditMode = () => {
    if (isEditMode) {
      setTempCards(cards);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = () => {
    setCards(tempCards);
    saveCharts(dashboardCardsToConfigs(tempCards));
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setTempCards(cards);
    setIsEditMode(false);
  };

  const handleResetDefault = () => {
    setTempCards(getDefaultCards());
  };

  // Open ChartBuilder for adding a new chart
  const handleAddCard = () => {
    setEditingConfig(undefined);
    setBuilderOpen(true);
  };

  // Open ChartBuilder for editing an existing chart
  const handleEditCard = (id: string) => {
    const card = tempCards.find((c) => c.config.id === id);
    if (card) {
      setEditingConfig(card.config);
      setBuilderOpen(true);
    }
  };

  const handleDeleteCard = (id: string) => {
    setTempCards(tempCards.filter((c) => c.config.id !== id));
  };

  const handleBuilderConfirm = (config: ChartConfig) => {
    setBuilderOpen(false);
    if (editingConfig) {
      // Edit existing card
      setTempCards((prev) =>
        prev.map((c) =>
          c.config.id === config.id
            ? { ...c, config, grid: config.layout }
            : c
        )
      );
    } else {
      // New card: prepend and shift others down
      const newCard: DashboardCard = {
        config,
        grid: { x: 0, y: 0, w: 6, h: 4 },
      };
      const shifted = tempCards.map((c) => ({
        ...c,
        grid: { ...c.grid, y: c.grid.y + 4 },
        config: { ...c.config, layout: { ...c.config.layout, y: c.config.layout.y + 4 } },
      }));
      setTempCards([newCard, ...shifted]);
    }
    setEditingConfig(undefined);
  };

  const handleBuilderCancel = () => {
    setBuilderOpen(false);
    setEditingConfig(undefined);
  };

  const handleLayoutChange = useCallback((layout: any) => {
    const arr = Array.isArray(layout) ? layout : [];
    setTempCards((prev) =>
      prev.map((card) => {
        const g = arr.find((l: any) => l.i === card.config.id);
        return g
          ? {
              ...card,
              grid: { x: g.x, y: g.y, w: g.w, h: g.h },
              config: {
                ...card.config,
                layout: { x: g.x, y: g.y, w: g.w, h: g.h },
              },
            }
          : card;
      }),
    );
  }, []);

  const displayCards = isEditMode ? tempCards : cards;

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
        <Button onClick={handleAddCard} variant="outline" size="sm">
          新建图表
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

  const renderCard = (card: DashboardCard) => (
    <Card className="shadow-sm h-full overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          {card.config.title}
        </CardTitle>
        {isEditMode && (
          <div className="flex gap-1">
            <button
              className="text-xs text-muted-foreground hover:text-foreground px-1"
              onClick={() => handleEditCard(card.config.id)}
              title="编辑图表"
            >
              ✎
            </button>
            <button
              className="text-xs text-muted-foreground hover:text-destructive px-1"
              onClick={() => handleDeleteCard(card.config.id)}
              title="删除图表"
            >
              ✕
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-1 overflow-hidden" style={{ height: 'calc(100% - 48px)' }}>
        <ChartCardContent config={card.config} />
      </CardContent>
    </Card>
  );

  // Fallback grid when react-grid-layout not loaded yet
  if (!GridLayout) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">自定义看板</h2>
          {renderToolbar()}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {displayCards.map((card) => (
            <div key={card.config.id} style={{ minHeight: 320 }}>
              {renderCard(card)}
            </div>
          ))}
        </div>
        <ChartBuilder
          open={builderOpen}
          editingConfig={editingConfig}
          dataSources={dataSources}
          onConfirm={handleBuilderConfirm}
          onCancel={handleBuilderCancel}
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
          layout={displayCards.map((c) => ({
            i: c.config.id,
            ...c.grid,
          }))}
          cols={12}
          rowHeight={80}
          width={1200}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
        >
          {displayCards.map((card) => (
            <div key={card.config.id}>{renderCard(card)}</div>
          ))}
        </GridLayout>
      </div>
      <ChartBuilder
        open={builderOpen}
        editingConfig={editingConfig}
        dataSources={dataSources}
        onConfirm={handleBuilderConfirm}
        onCancel={handleBuilderCancel}
      />
    </div>
  );
}
