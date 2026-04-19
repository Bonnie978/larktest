import { useState, useCallback, useEffect } from 'react';
import type { Layout } from 'react-grid-layout';

export interface DashboardCard {
  i: string;
  title: string;
  type: 'placeholder';
}

const STORAGE_KEY = 'dashboard-v2';

const DEFAULT_CARDS: DashboardCard[] = [
  { i: 'card-1', title: '产量趋势', type: 'placeholder' },
  { i: 'card-2', title: '设备稼动率', type: 'placeholder' },
  { i: 'card-3', title: '质量分析', type: 'placeholder' },
  { i: 'card-4', title: '工单进度', type: 'placeholder' },
];

const DEFAULT_LAYOUTS: Layout[] = [
  { i: 'card-1', x: 0, y: 0, w: 6, h: 4 },
  { i: 'card-2', x: 6, y: 0, w: 6, h: 4 },
  { i: 'card-3', x: 0, y: 4, w: 6, h: 4 },
  { i: 'card-4', x: 6, y: 4, w: 6, h: 4 },
];

interface DashboardState {
  cards: DashboardCard[];
  layouts: Layout[];
}

function loadFromStorage(): DashboardState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardState;
  } catch {
    return null;
  }
}

function saveToStorage(state: DashboardState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let nextId = 100;

export function useDashboard() {
  const [editing, setEditing] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>(() => {
    return loadFromStorage()?.cards ?? DEFAULT_CARDS;
  });
  const [layouts, setLayouts] = useState<Layout[]>(() => {
    return loadFromStorage()?.layouts ?? DEFAULT_LAYOUTS;
  });

  const toggleEditing = useCallback(() => setEditing(prev => !prev), []);

  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayouts(newLayout);
  }, []);

  const addCard = useCallback(() => {
    const id = `card-${++nextId}`;
    const newCard: DashboardCard = { i: id, title: `图表 ${nextId}`, type: 'placeholder' };
    const newLayout: Layout = { i: id, x: 0, y: Infinity, w: 6, h: 4 };
    setCards(prev => [...prev, newCard]);
    setLayouts(prev => [...prev, newLayout]);
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.i !== cardId));
    setLayouts(prev => prev.filter(l => l.i !== cardId));
  }, []);

  const save = useCallback(() => {
    saveToStorage({ cards, layouts });
    setEditing(false);
  }, [cards, layouts]);

  const resetToDefault = useCallback(() => {
    setCards(DEFAULT_CARDS);
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    editing,
    toggleEditing,
    cards,
    layouts,
    onLayoutChange,
    addCard,
    removeCard,
    save,
    resetToDefault,
  };
}
