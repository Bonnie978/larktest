import { useState, useCallback } from 'react';
import type { Layout } from 'react-grid-layout';
import type {
  DashboardCard,
  CardConfig,
  ChartType,
  BuilderState,
  BuilderMode,
  DashboardLayout,
} from '@/types/dashboard';
import {
  STORAGE_KEY,
  LAYOUT_VERSION,
  DEFAULT_DASHBOARD,
  GRID_CONFIG,
} from '@/constants/dashboard';

function loadFromStorage(): DashboardCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DASHBOARD;
    const parsed = JSON.parse(raw) as DashboardLayout;
    if (parsed.version !== LAYOUT_VERSION) return DEFAULT_DASHBOARD;
    if (!Array.isArray(parsed.cards)) return DEFAULT_DASHBOARD;
    return parsed.cards;
  } catch {
    return DEFAULT_DASHBOARD;
  }
}

function saveToStorage(cards: DashboardCard[]): void {
  const layout: DashboardLayout = { version: LAYOUT_VERSION, cards };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
}

export function useDashboard() {
  const [cards, setCards] = useState<DashboardCard[]>(() => loadFromStorage());
  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<DashboardCard[] | null>(null);
  const [builder, setBuilder] = useState<BuilderState>({
    open: false,
    mode: 'create',
    editingCardId: null,
  });

  const closeBuilder = useCallback(() => {
    setBuilder({ open: false, mode: 'create', editingCardId: null });
  }, []);

  const enterEditMode = useCallback(() => {
    setSnapshot(JSON.parse(JSON.stringify(cards)));
    setIsEditing(true);
  }, [cards]);

  const cancelEdit = useCallback(() => {
    if (snapshot) setCards(snapshot);
    setSnapshot(null);
    setIsEditing(false);
    closeBuilder();
  }, [snapshot, closeBuilder]);

  const saveLayout = useCallback(() => {
    saveToStorage(cards);
    setSnapshot(null);
    setIsEditing(false);
    closeBuilder();
  }, [cards, closeBuilder]);

  const resetToDefault = useCallback(() => {
    setCards(DEFAULT_DASHBOARD);
  }, []);

  const addCard = useCallback((config: CardConfig) => {
    setCards((prev) => {
      const shifted = prev.map((c) => ({
        ...c,
        grid: { ...c.grid, y: c.grid.y + GRID_CONFIG.minH },
      }));
      const newCard: DashboardCard = {
        config,
        grid: { x: 0, y: 0, w: 6, h: 4 },
      };
      return [newCard, ...shifted];
    });
  }, []);

  const updateCard = useCallback((config: CardConfig) => {
    setCards((prev) =>
      prev.map((c) => (c.config.id === config.id ? { ...c, config } : c))
    );
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.config.id !== cardId));
  }, []);

  const updateCardChartType = useCallback((cardId: string, chartType: ChartType) => {
    setCards((prev) =>
      prev.map((c) =>
        c.config.id === cardId ? { ...c, config: { ...c.config, chartType } } : c
      )
    );
  }, []);

  const onLayoutChange = useCallback((layout: Layout[]) => {
    setCards((prev) =>
      prev.map((card) => {
        const item = layout.find((l) => l.i === card.config.id);
        if (!item) return card;
        return {
          ...card,
          grid: { x: item.x, y: item.y, w: item.w, h: item.h },
        };
      })
    );
  }, []);

  const openBuilder = useCallback((mode: BuilderMode, cardId?: string) => {
    setBuilder({ open: true, mode, editingCardId: cardId ?? null });
  }, []);

  return {
    cards,
    isEditing,
    builder,
    enterEditMode,
    cancelEdit,
    saveLayout,
    resetToDefault,
    addCard,
    updateCard,
    deleteCard,
    updateCardChartType,
    onLayoutChange,
    openBuilder,
    closeBuilder,
  };
}
