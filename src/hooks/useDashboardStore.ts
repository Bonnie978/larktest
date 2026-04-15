// src/hooks/useDashboardStore.ts
import { useState, useCallback } from 'react';
import type { CardConfig, DashboardCard, DashboardLayout, GridPosition, ChartType } from '@/types/dashboard';

const STORAGE_KEY = 'dashboard-v2';

export const DEFAULT_CARDS: DashboardCard[] = [
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

export function loadDashboard(): DashboardCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CARDS;
    const parsed = JSON.parse(raw) as DashboardLayout;
    if (parsed.version !== 2 || !Array.isArray(parsed.cards)) return DEFAULT_CARDS;
    return parsed.cards;
  } catch {
    return DEFAULT_CARDS;
  }
}

export function saveDashboard(cards: DashboardCard[]): void {
  const layout: DashboardLayout = { version: 2, cards };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
}

export function useDashboardStore() {
  const [cards, setCards] = useState<DashboardCard[]>(() => loadDashboard());
  const [snapshot, setSnapshot] = useState<DashboardCard[]>(() => loadDashboard());
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = useCallback(() => {
    setSnapshot([...cards]);
    setIsEditing(true);
  }, [cards]);

  const save = useCallback(() => {
    saveDashboard(cards);
    setSnapshot(cards);
    setIsEditing(false);
  }, [cards]);

  const cancel = useCallback(() => {
    setCards(snapshot);
    setIsEditing(false);
  }, [snapshot]);

  const addCard = useCallback((config: CardConfig) => {
    setCards((prev) => {
      const maxY = prev.reduce((max, c) => Math.max(max, c.grid.y + c.grid.h), 0);
      return [...prev, { config, grid: { x: 0, y: maxY, w: 6, h: 4 } }];
    });
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<CardConfig>) => {
    setCards((prev) =>
      prev.map((c) =>
        c.config.id === cardId ? { ...c, config: { ...c.config, ...updates } } : c
      )
    );
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.config.id !== cardId));
  }, []);

  const updateLayout = useCallback((positions: Array<{ id: string; grid: GridPosition }>) => {
    setCards((prev) =>
      prev.map((c) => {
        const pos = positions.find((p) => p.id === c.config.id);
        return pos ? { ...c, grid: pos.grid } : c;
      })
    );
  }, []);

  const resetToDefault = useCallback(() => {
    setCards(DEFAULT_CARDS);
    saveDashboard(DEFAULT_CARDS);
  }, []);

  return {
    cards,
    isEditing,
    startEditing,
    save,
    cancel,
    addCard,
    updateCard,
    deleteCard,
    updateLayout,
    resetToDefault,
  };
}
