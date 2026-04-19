import type { Layout } from 'react-grid-layout';

export interface DashboardCard {
  i: string;
  title: string;
  type: 'placeholder';
}

export interface DashboardState {
  cards: DashboardCard[];
  layouts: Layout[];
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

export function getDefaultDashboard(): DashboardState {
  return {
    cards: [...DEFAULT_CARDS],
    layouts: DEFAULT_LAYOUTS.map(l => ({ ...l })),
  };
}

export function loadDashboard(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultDashboard();
    const parsed = JSON.parse(raw) as DashboardState;
    if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.layouts)) {
      return getDefaultDashboard();
    }
    return parsed;
  } catch {
    return getDefaultDashboard();
  }
}

export function saveDashboard(state: DashboardState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearDashboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}
