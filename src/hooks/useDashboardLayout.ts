import { useState, useCallback } from 'react';

export interface DashboardCard {
  id: string;
  indicatorId: string;
  chartType: string;
  layout: { x: number; y: number; w: number; h: number };
}

interface PersistedLayout {
  version: 1;
  cards: DashboardCard[];
}

export interface UseDashboardLayoutReturn {
  cards: DashboardCard[];
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  updateLayout: (cards: DashboardCard[]) => void;
  addCard: (indicatorId: string, chartType: string) => void;
  deleteCard: (cardId: string) => void;
  changeChartType: (cardId: string, chartType: string) => void;
  save: () => void;
  cancel: () => void;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'dashboard-layout-v1';

const DEFAULT_CARDS: DashboardCard[] = [
  {
    id: 'default-kpi',
    indicatorId: 'kpi-overview',
    chartType: 'table',
    layout: { x: 0, y: -1, w: 12, h: 2 },
  },
  {
    id: 'default-line-production',
    indicatorId: 'line-production',
    chartType: 'bar',
    layout: { x: 0, y: 0, w: 6, h: 4 },
  },
  {
    id: 'default-weekly-defect',
    indicatorId: 'weekly-defect-rate',
    chartType: 'line',
    layout: { x: 6, y: 0, w: 6, h: 4 },
  },
  {
    id: 'default-defect-distribution',
    indicatorId: 'defect-type-distribution',
    chartType: 'pie',
    layout: { x: 0, y: 4, w: 6, h: 4 },
  },
];

function loadLayout(): DashboardCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CARDS;
    const parsed = JSON.parse(raw) as PersistedLayout;
    if (parsed.version !== 1 || !Array.isArray(parsed.cards)) return DEFAULT_CARDS;
    return parsed.cards;
  } catch {
    return DEFAULT_CARDS;
  }
}

function saveLayout(cards: DashboardCard[]): void {
  const payload: PersistedLayout = { version: 1, cards };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function useDashboardLayout(): UseDashboardLayoutReturn {
  const [cards, setCards] = useState<DashboardCard[]>(() => loadLayout());
  const [savedCards, setSavedCards] = useState<DashboardCard[]>(() => loadLayout());
  const [isEditing, setIsEditing] = useState(false);

  const updateLayout = useCallback((updatedCards: DashboardCard[]) => {
    setCards(updatedCards);
  }, []);

  const addCard = useCallback((indicatorId: string, chartType: string) => {
    setCards((prev) => {
      const maxY = prev.reduce((max, c) => Math.max(max, c.layout.y + c.layout.h), 0);
      const newCard: DashboardCard = {
        id: Date.now().toString(),
        indicatorId,
        chartType,
        layout: { x: 0, y: maxY, w: 6, h: 4 },
      };
      return [...prev, newCard];
    });
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const changeChartType = useCallback((cardId: string, chartType: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, chartType } : c))
    );
  }, []);

  const save = useCallback(() => {
    saveLayout(cards);
    setSavedCards(cards);
    setIsEditing(false);
  }, [cards]);

  const cancel = useCallback(() => {
    setCards(savedCards);
    setIsEditing(false);
  }, [savedCards]);

  const resetToDefault = useCallback(() => {
    setCards(DEFAULT_CARDS);
    saveLayout(DEFAULT_CARDS);
    setSavedCards(DEFAULT_CARDS);
  }, []);

  return {
    cards,
    isEditing,
    setIsEditing,
    updateLayout,
    addCard,
    deleteCard,
    changeChartType,
    save,
    cancel,
    resetToDefault,
  };
}
