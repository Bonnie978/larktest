import { useState, useEffect, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import '@/grid-layout.css';

interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: 'bar' | 'line' | 'pie';
  groupByField: string;
  valueFields: string[];
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'none';
}

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
      dataSourceId: 'quality',
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

export default function DashboardEditor() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [tempCards, setTempCards] = useState<DashboardCard[]>([]);

  useEffect(() => {
    const loaded = loadDashboard();
    setCards(loaded);
    setTempCards(loaded);
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

  const handleAddCard = () => {
    const newCard: DashboardCard = {
      config: {
        id: Date.now().toString(),
        title: '新建图表',
        dataSourceId: 'line-production',
        chartType: 'bar',
        groupByField: 'lineName',
        valueFields: ['planned'],
        aggregation: 'none',
      },
      grid: { x: 0, y: 0, w: 6, h: 4 },
    };
    const shifted = tempCards.map((c) => ({
      ...c,
      grid: { ...c.grid, y: c.grid.y + 4 },
    }));
    setTempCards([newCard, ...shifted]);
  };

  const handleDeleteCard = (id: string) => {
    setTempCards(tempCards.filter((c) => c.config.id !== id));
  };

  const handleLayoutChange = useCallback((layout: any) => {
    const arr = Array.isArray(layout) ? layout : [];
    setTempCards((prev) =>
      prev.map((card) => {
        const g = arr.find((l: any) => l.i === card.config.id);
        return g
          ? { ...card, grid: { x: g.x, y: g.y, w: g.w, h: g.h } }
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
              onClick={() => {}}
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
      <CardContent className="px-4 pb-3 flex-1 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          图表占位符 - {card.config.chartType}
        </span>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">自定义看板</h2>
        {renderToolbar()}
      </div>
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
            enabled: isEditMode,
          }}
          resizeConfig={{
            enabled: isEditMode,
          }}
          onLayoutChange={handleLayoutChange}
        >
          {displayCards.map((card) => (
            <div
              key={card.config.id}
              data-grid={{
                x: card.grid.x,
                y: card.grid.y,
                w: card.grid.w,
                h: card.grid.h,
                minW: 2,
                minH: 2,
              }}
            >
              {renderCard(card)}
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}
