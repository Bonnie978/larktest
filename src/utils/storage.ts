import type { ChartConfig } from '@/types/dashboard';

const STORAGE_KEY = 'dashboard-charts';

export function loadCharts(): ChartConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChartConfig[];
  } catch {
    return [];
  }
}

export function saveCharts(charts: ChartConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
  } catch (e) {
    console.error('Failed to save charts to localStorage', e);
  }
}

export function clearCharts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear charts from localStorage', e);
  }
}
