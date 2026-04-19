import { useState, useCallback } from 'react';
import type { CardItem, CardConfig, DashboardState, LayoutItem } from '@/types/dashboard';

const STORAGE_KEY = 'dashboard-v2';

const DEFAULT_CARDS: CardItem[] = [
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

function loadFromStorage(): CardItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CARDS;
    const parsed: DashboardState = JSON.parse(raw);
    if (parsed.version !== 2) return DEFAULT_CARDS;
    if (!Array.isArray(parsed.cards)) return DEFAULT_CARDS;
    return parsed.cards;
  } catch {
    return DEFAULT_CARDS;
  }
}

function saveToStorage(cards: CardItem[]) {
  const state: DashboardState = { version: 2, cards };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export interface UseDashboardReturn {
  cards: CardItem[];
  isEditing: boolean;
  setEditing: (v: boolean) => void;
  addCard: (config: CardConfig) => void;
  updateCard: (id: string, config: Partial<CardConfig>) => void;
  removeCard: (id: string) => void;
  updateLayout: (layout: LayoutItem[]) => void;
  save: () => void;
  resetToDefault: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [cards, setCards] = useState<CardItem[]>(() => loadFromStorage());
  const [isEditing, setEditing] = useState(false);

  const addCard = useCallback((config: CardConfig) => {
    setCards((prev) => {
      const maxY = prev.reduce((max, c) => Math.max(max, c.grid.y + c.grid.h), 0);
      return [
        ...prev,
        { config, grid: { x: 0, y: maxY, w: 6, h: 4 } },
      ];
    });
  }, []);

  const updateCard = useCallback((id: string, partial: Partial<CardConfig>) => {
    setCards((prev) =>
      prev.map((c) =>
        c.config.id === id
          ? { ...c, config: { ...c.config, ...partial } }
          : c
      )
    );
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.config.id !== id));
  }, []);

  const updateLayout = useCallback((layout: LayoutItem[]) => {
    setCards((prev) =>
      prev.map((card) => {
        const l = layout.find((item) => item.i === card.config.id);
        if (!l) return card;
        return { ...card, grid: { x: l.x, y: l.y, w: l.w, h: l.h } };
      })
    );
  }, []);

  const save = useCallback(() => {
    saveToStorage(cards);
    setEditing(false);
  }, [cards]);

  const resetToDefault = useCallback(() => {
    setCards(DEFAULT_CARDS);
    saveToStorage(DEFAULT_CARDS);
  }, []);

  return {
    cards,
    isEditing,
    setEditing,
    addCard,
    updateCard,
    removeCard,
    updateLayout,
    save,
    resetToDefault,
  };
}
