import { describe, it, expect } from 'vitest';
import { aggregate } from '../aggregation';

describe('aggregate', () => {
  const sampleData = [
    { lineName: 'A线', oee: 78.6, performance: 88.7 },
    { lineName: 'A线', oee: 72.3, performance: 85.3 },
    { lineName: 'B线', oee: 73.7, performance: 86.1 },
    { lineName: 'B线', oee: 81.1, performance: 90.5 },
  ];

  // none
  it('none: 直接透传，仅保留指定字段', () => {
    const result = aggregate(sampleData, 'lineName', ['oee'], 'none');
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ lineName: 'A线', oee: 78.6 });
    expect(result[0]).not.toHaveProperty('performance');
  });

  it('none: 不改变数据顺序和数量', () => {
    const result = aggregate(sampleData, 'lineName', ['oee'], 'none');
    expect(result.map((r) => r.oee)).toEqual([78.6, 72.3, 73.7, 81.1]);
  });

  // sum
  it('sum: 按分组字段求和', () => {
    const result = aggregate(sampleData, 'lineName', ['oee'], 'sum');
    expect(result).toHaveLength(2);
    const a = result.find((r) => r.lineName === 'A线');
    expect(a?.oee).toBeCloseTo(150.9);
  });

  it('sum: 多个 valueFields 分别求和', () => {
    const result = aggregate(sampleData, 'lineName', ['oee', 'performance'], 'sum');
    const a = result.find((r) => r.lineName === 'A线');
    expect(a?.oee).toBeCloseTo(150.9);
    expect(a?.performance).toBeCloseTo(174.0);
  });

  // avg
  it('avg: 按分组字段求平均，保留1位小数', () => {
    const result = aggregate(sampleData, 'lineName', ['oee'], 'avg');
    const a = result.find((r) => r.lineName === 'A线');
    expect(a?.oee).toBe(75.4); // (78.6+72.3)/2 = 75.45 → toFixed(1) → 75.4
    const b = result.find((r) => r.lineName === 'B线');
    expect(b?.oee).toBe(77.4); // (73.7+81.1)/2 = 77.4
  });

  // count
  it('count: 按分组字段计数', () => {
    const result = aggregate(sampleData, 'lineName', ['oee'], 'count');
    const a = result.find((r) => r.lineName === 'A线');
    expect(a?.oee).toBe(2);
  });

  // max
  it('max: 按分组字段取最大值', () => {
    const result = aggregate(sampleData, 'lineName', ['oee'], 'max');
    const a = result.find((r) => r.lineName === 'A线');
    expect(a?.oee).toBe(78.6);
    const b = result.find((r) => r.lineName === 'B线');
    expect(b?.oee).toBe(81.1);
  });

  // 边界
  it('空数据返回空数组', () => {
    expect(aggregate([], 'lineName', ['oee'], 'sum')).toEqual([]);
  });

  it('单条数据返回自身', () => {
    const result = aggregate([{ name: 'X', val: 10 }], 'name', ['val'], 'sum');
    expect(result).toEqual([{ name: 'X', val: 10 }]);
  });

  it('值为非数字时当作0', () => {
    const data = [
      { type: 'A', count: undefined },
      { type: 'A', count: 'abc' },
      { type: 'A', count: 5 },
    ];
    const result = aggregate(data, 'type', ['count'], 'sum');
    expect(result[0].count).toBe(5);
  });

  it('分组键为null时转为空字符串', () => {
    const data = [
      { type: null, val: 10 },
      { type: null, val: 20 },
    ];
    const result = aggregate(data, 'type', ['val'], 'sum');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('');
    expect(result[0].val).toBe(30);
  });
});
