import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboard } from '../useDashboard';
import { STORAGE_KEY, DEFAULT_DASHBOARD } from '@/constants/dashboard';
import type { CardConfig } from '@/types/dashboard';

describe('useDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('初始化：localStorage 为空时返回默认看板', () => {
    const { result } = renderHook(() => useDashboard());
    expect(result.current.cards).toEqual(DEFAULT_DASHBOARD);
    expect(result.current.isEditing).toBe(false);
  });

  it('初始化：localStorage 无效 JSON 时返回默认看板', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid{{{');
    const { result } = renderHook(() => useDashboard());
    expect(result.current.cards).toEqual(DEFAULT_DASHBOARD);
  });

  it('初始化：version 不等于 2 时返回默认看板', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, cards: [] }));
    const { result } = renderHook(() => useDashboard());
    expect(result.current.cards).toEqual(DEFAULT_DASHBOARD);
  });

  it('初始化：cards 非数组时返回默认看板', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, cards: 'bad' }));
    const { result } = renderHook(() => useDashboard());
    expect(result.current.cards).toEqual(DEFAULT_DASHBOARD);
  });

  it('addCard：新卡片在 y=0，已有卡片下移', () => {
    const { result } = renderHook(() => useDashboard());
    const newConfig: CardConfig = {
      id: 'new-1',
      title: '测试图表',
      dataSourceId: 'equipment',
      chartType: 'bar',
      groupByField: 'name',
      valueFields: ['oee'],
      aggregation: 'none',
    };

    act(() => result.current.addCard(newConfig));

    expect(result.current.cards[0].config.id).toBe('new-1');
    expect(result.current.cards[0].grid.y).toBe(0);
    // 原来 y=0 的卡片应该下移 4 行
    const shifted = result.current.cards.find((c) => c.config.id === 'default-1');
    expect(shifted?.grid.y).toBe(4);
  });

  it('deleteCard：删除后 cards 长度减少', () => {
    const { result } = renderHook(() => useDashboard());
    const before = result.current.cards.length;

    act(() => result.current.deleteCard('default-1'));

    expect(result.current.cards.length).toBe(before - 1);
    expect(result.current.cards.find((c) => c.config.id === 'default-1')).toBeUndefined();
  });

  it('cancelEdit：恢复到进入编辑前的状态', () => {
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.enterEditMode());
    act(() => result.current.deleteCard('default-1'));

    expect(result.current.cards.length).toBe(2);

    act(() => result.current.cancelEdit());

    expect(result.current.cards.length).toBe(3);
    expect(result.current.isEditing).toBe(false);
  });

  it('saveLayout：写入 localStorage', () => {
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.enterEditMode());
    act(() => result.current.deleteCard('default-3'));
    act(() => result.current.saveLayout());

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.version).toBe(2);
    expect(stored.cards.length).toBe(2);
    expect(result.current.isEditing).toBe(false);
  });

  it('resetToDefault：恢复默认且保持编辑模式', () => {
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.enterEditMode());
    act(() => result.current.deleteCard('default-1'));
    act(() => result.current.deleteCard('default-2'));
    act(() => result.current.resetToDefault());

    expect(result.current.cards).toEqual(DEFAULT_DASHBOARD);
    expect(result.current.isEditing).toBe(true);
  });

  it('updateCardChartType：仅改变 chartType', () => {
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.updateCardChartType('default-1', 'line'));

    const card = result.current.cards.find((c) => c.config.id === 'default-1');
    expect(card?.config.chartType).toBe('line');
    expect(card?.config.title).toBe('产线产量完成情况');
  });
});
