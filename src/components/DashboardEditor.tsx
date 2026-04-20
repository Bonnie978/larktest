import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChartBuilder from '@/components/dashboard/ChartBuilder';
import ChartPreview from '@/components/dashboard/ChartPreview';
import type { CardConfig, DataSourceMeta, AggregationType } from '@/types/dashboard';
import { getDataSources, getDataSourceData } from '@/api';
import { useRequest } from '@/hooks/useRequest';

interface GridLayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardCard {
  config: CardConfig;
  grid: GridLayoutItem;
}

interface DashboardConfig {
  version: number;
  cards: DashboardCard[];
}

const getDefaultCards = (): DashboardCard[] => [
  {
    config: {
      id: 'default-1',
      title: '产线产量完成情况',
      dataSourceId: 'line-production',
      chartType: 'bar',
      groupByField: 'lineName',
      valueFields: ['planned', 'actual'],
      aggregation: 'none',
    },
    grid: { x: 0, y: 0, w: 6, h: 4 },
  },
  {
    config: {
      id: 'default-2',
      title: '近7天不良率趋势',
      dataSourceId: 'weekly-defects',
      chartType: 'line',
      groupByField: 'date',
      valueFields: ['defectRate'],
      aggregation: 'none',
    },
    grid: { x: 6, y: 0, w: 6, h: 4 },
  },
  {
    config: {
      id: 'default-3',
      title: '不良类型分布',
      dataSourceId: 'quality-records',
      chartType: 'pie',
      groupByField: 'defectType',
      valueFields: ['defectCount'],
      aggregation: 'sum',
    },
    grid: { x: 0, y: 4, w: 6, h: 4 },
  },
];

const STORAGE_KEY = 'dashboard-v2';

const loadDashboard = (): DashboardCard[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultCards();
    const config: DashboardConfig = JSON.parse(saved);
    if (config.version !== 2 || !Array.isArray(config.cards)) {
      return getDefaultCards();
    }
    return config.cards;
  } catch {
    return getDefaultCards();
  }
};

const saveDashboard = (cards: DashboardCard[]) => {
  const config: DashboardConfig = { version: 2, cards };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

/** Small wrapper that fetches data for a single card and renders ChartPreview */
function CardChartRenderer({ config, dataSources }: { config: CardConfig; dataSources: DataSourceMeta[] }) {
  const { data: rawData } = useRequest(
    () => config.dataSourceId ? getDataSourceData(config.dataSourceId) : Promise.resolve([]),
    [config.dataSourceId],
  );

  const fieldLabels = useMemo(() => {
    const ds = dataSources.find(d => d.id === config.dataSourceId);
    const map: Record<string, string> = {};
    ds?.fields.forEach(f => { map[f.name] = f.label; });
    return map;
  }, [dataSources, config.dataSourceId]);

  if (!rawData) {
    return <span className="text-sm text-muted-foreground">加载中…</span>;
  }

  return (
    <ChartPreview
      rawData={rawData}
      groupByField={config.groupByField}
      valueFields={config.valueFields}
      fieldLabels={fieldLabels}
      chartType={config.chartType}
      aggregation={config.aggregation as AggregationType}
    />
  );
}

export default function DashboardEditor() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [tempCards, setTempCards] = useState<DashboardCard[]>([]);

  // ChartBuilder state
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Fetch data sources from API
  const { data: dataSources } = useRequest(() => getDataSources(), []);
  const dsList: DataSourceMeta[] = dataSources ?? [];

  // Dynamically import react-grid-layout
  const [GridLayout, setGridLayout] = useState<any>(null);

  useEffect(() => {
    const loaded = loadDashboard();
    setCards(loaded);
    setTempCards(loaded);
  }, []);

  useEffect(() => {
    import('react-grid-layout').then((mod) => {
      setGridLayout(() => mod.default);
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
    saveDashboard(tempCards);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setTempCards(cards);
    setIsEditMode(false);
  };

  const handleResetDefault = () => {
    setTempCards(getDefaultCards());
  };

  // Open ChartBuilder for new chart
  const handleOpenBuilder = () => {
    setEditingCardId(null);
    setBuilderOpen(true);
  };

  // Open ChartBuilder for editing existing chart
  const handleEditCard = (id: string) => {
    setEditingCardId(id);
    setBuilderOpen(true);
  };

  // ChartBuilder confirm callback
  const handleBuilderConfirm = (config: CardConfig) => {
    if (editingCardId) {
      // Update existing card
      setTempCards(prev =>
        prev.map(c =>
          c.config.id === editingCardId ? { ...c, config } : c,
        ),
      );
    } else {
      // Add new card at top, shift others down
      const newCard: DashboardCard = {
        config,
        grid: { x: 0, y: 0, w: 6, h: 4 },
      };
      const shifted = tempCards.map(c => ({
        ...c,
        grid: { ...c.grid, y: c.grid.y + 4 },
      }));
      setTempCards([newCard, ...shifted]);
    }
    setBuilderOpen(false);
    setEditingCardId(null);
  };

  const handleBuilderCancel = () => {
    setBuilderOpen(false);
    setEditingCardId(null);
  };

  const handleDeleteCard = (id: string) => {
    setTempCards(tempCards.filter(c => c.config.id !== id));
  };

  const handleLayoutChange = useCallback((layout: any) => {
    const arr = Array.isArray(layout) ? layout : [];
    setTempCards(prev =>
      prev.map(card => {
        const g = arr.find((l: any) => l.i === card.config.id);
        return g
          ? { ...card, grid: { x: g.x, y: g.y, w: g.w, h: g.h } }
          : card;
      }),
    );
  }, []);

  const displayCards = isEditMode ? tempCards : cards;

  const editingConfig = editingCardId
    ? tempCards.find(c => c.config.id === editingCardId)?.config
    : undefined;

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
        <Button onClick={handleOpenBuilder} variant="outline" size="sm">
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
    <Card className="shadow-sm h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-sm font-medium truncate">
          {card.config.title}
        </CardTitle>
        {isEditMode && (
          <div className="flex gap-1">
            <button
              className="text-xs text-muted-foreground hover:text-foreground px-1"
              onClick={() => handleEditCard(card.config.id)}
            >
              ✎
            </button>
            <button
              className="text-xs text-muted-foreground hover:text-destructive px-1"
              onClick={() => handleDeleteCard(card.config.id)}
            >
              ✕
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-1 min-h-0">
        <CardChartRenderer config={card.config} dataSources={dsList} />
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
          {displayCards.map(card => (
            <div key={card.config.id} style={{ minHeight: 320 }}>
              {renderCard(card)}
            </div>
          ))}
        </div>
        <ChartBuilder
          open={builderOpen}
          editingConfig={editingConfig}
          dataSources={dsList}
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
          layout={displayCards.map(c => ({
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
          {displayCards.map(card => (
            <div key={card.config.id}>{renderCard(card)}</div>
          ))}
        </GridLayout>
      </div>
      <ChartBuilder
        open={builderOpen}
        editingConfig={editingConfig}
        dataSources={dsList}
        onConfirm={handleBuilderConfirm}
        onCancel={handleBuilderCancel}
      />
    </div>
  );
}
