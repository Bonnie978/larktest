import { useState, useCallback } from 'react';
import type { Layout } from 'react-grid-layout';
import {
  loadDashboard,
  saveDashboard,
  clearDashboard,
  getDefaultDashboard,
} from '@/utils/storage';
import type { DashboardCard, CardConfig } from '@/utils/storage';

export type { DashboardCard, CardConfig } from '@/utils/storage';

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

  const addCard = useCallback((config: CardConfig) => {
    const id = `card-${++nextId}`;
    const newCard: DashboardCard = { i: id, config };
    const newLayout: Layout = { i: id, x: 0, y: Infinity, w: 6, h: 4 };
    setCards(prev => [...prev, newCard]);
    setLayouts(prev => [...prev, newLayout]);
  }, []);

  const updateCard = useCallback((cardId: string, config: CardConfig) => {
    setCards(prev => prev.map(c => c.i === cardId ? { ...c, config } : c));
  }, []);

  const updateChartType = useCallback((cardId: string, chartType: 'bar' | 'line' | 'pie') => {
    setCards(prev => prev.map(c => 
      c.i === cardId ? { ...c, config: { ...c.config, chartType } } : c
    ));
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.i !== cardId));
    setLayouts(prev => prev.filter(l => l.i !== cardId));
  }, []);

  const save = useCallback(() => {
    saveDashboard({ version: 2, cards, layouts });
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
    updateCard,
    updateChartType,
    removeCard,
    save,
    resetToDefault,
  };
}
