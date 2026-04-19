import { useState, useCallback } from 'react';
import type { Layout } from 'react-grid-layout';
import {
  loadDashboard,
  saveDashboard,
  clearDashboard,
  getDefaultDashboard,
} from '@/utils/storage';
import type { DashboardCard } from '@/utils/storage';

export type { DashboardCard } from '@/utils/storage';

let nextId = 100;

export function useDashboard() {
  const [editing, setEditing] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>(() => {
    return loadDashboard().cards;
  });
  const [layouts, setLayouts] = useState<Layout[]>(() => {
    return loadDashboard().layouts;
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
    saveDashboard({ cards, layouts });
    setEditing(false);
  }, [cards, layouts]);

  const resetToDefault = useCallback(() => {
    const defaults = getDefaultDashboard();
    setCards(defaults.cards);
    setLayouts(defaults.layouts);
    clearDashboard();
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
