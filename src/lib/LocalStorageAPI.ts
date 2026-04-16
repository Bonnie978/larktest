import type { DashboardConfig } from '@/types/dashboard';

const STORAGE_KEY = 'dashboard_config_v1';
const VERSION = '1.0';

export class LocalStorageAPI {
  static save(config: DashboardConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, version: VERSION }));
    } catch {
      // silent fail
    }
  }

  static load(): DashboardConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DashboardConfig;
      if (!parsed.cards || !parsed.layout) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // silent fail
    }
  }
}
