// src/hooks/__tests__/useDashboardStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { loadDashboard, saveDashboard, DEFAULT_CARDS } from '../useDashboardStore';
import type { DashboardLayout } from '@/types/dashboard';

beforeEach(() => {
  localStorage.clear();
});

describe('loadDashboard', () => {
  it('returns default cards when localStorage is empty', () => {
    const cards = loadDashboard();
    expect(cards).toEqual(DEFAULT_CARDS);
  });

  it('loads saved cards from localStorage', () => {
    const saved: DashboardLayout = { version: 2, cards: [DEFAULT_CARDS[0]] };
    localStorage.setItem('dashboard-v2', JSON.stringify(saved));
    const cards = loadDashboard();
    expect(cards).toHaveLength(1);
    expect(cards[0].config.id).toBe(DEFAULT_CARDS[0].config.id);
  });

  it('falls back to default on corrupted data', () => {
    localStorage.setItem('dashboard-v2', 'NOT VALID JSON{{{');
    const cards = loadDashboard();
    expect(cards).toEqual(DEFAULT_CARDS);
  });

  it('falls back to default on wrong version', () => {
    localStorage.setItem('dashboard-v2', JSON.stringify({ version: 99, cards: [] }));
    const cards = loadDashboard();
    expect(cards).toEqual(DEFAULT_CARDS);
  });
});

describe('saveDashboard', () => {
  it('saves cards to localStorage', () => {
    saveDashboard([DEFAULT_CARDS[0]]);
    const raw = localStorage.getItem('dashboard-v2');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as DashboardLayout;
    expect(parsed.version).toBe(2);
    expect(parsed.cards).toHaveLength(1);
  });
});
