import { describe, expect, it } from 'vitest';
import { DataAggregator } from './aggregator';
import type { ChartConfig } from '@/types/dashboard';

const aggregator = new DataAggregator();

function createConfig(overrides: Partial<ChartConfig> = {}): ChartConfig {
  return {
    id: 'chart-1',
    title: '测试图表',
    dataSource: 'line-production',
    dimension: 'line',
    metrics: ['output'],
    aggregation: 'sum',
    chartType: 'bar',
    layout: { x: 0, y: 0, w: 4, h: 4 },
    ...overrides,
  };
}

describe('DataAggregator', () => {
  it('returns empty metric series for empty raw data', () => {
    const result = aggregator.aggregate([], createConfig({ metrics: ['output', 'scrap'] }));

    expect(result).toEqual([
      { name: 'output', data: [] },
      { name: 'scrap', data: [] },
    ]);
  });

  it('normalizes missing dimension values into a stable fallback bucket', () => {
    const result = aggregator.aggregate(
      [
        { line: undefined, output: 10 },
        { line: null, output: 5 },
        { line: '', output: 8 },
      ],
      createConfig()
    );

    expect(result).toEqual([
      {
        name: 'output',
        data: [{ category: '未分组', value: 23 }],
      },
    ]);
  });

  it('filters non-numeric values for numeric aggregations', () => {
    const rawData = [
      { line: 'A', output: 10 },
      { line: 'A', output: '20' },
      { line: 'A', output: 'bad-data' },
      { line: 'A', output: null },
      { line: 'A', output: Number.NaN },
    ];

    expect(aggregator.aggregate(rawData, createConfig({ aggregation: 'sum' }))[0].data).toEqual([
      { category: 'A', value: 30 },
    ]);
    expect(aggregator.aggregate(rawData, createConfig({ aggregation: 'avg' }))[0].data).toEqual([
      { category: 'A', value: 15 },
    ]);
    expect(aggregator.aggregate(rawData, createConfig({ aggregation: 'max' }))[0].data).toEqual([
      { category: 'A', value: 20 },
    ]);
    expect(aggregator.aggregate(rawData, createConfig({ aggregation: 'min' }))[0].data).toEqual([
      { category: 'A', value: 10 },
    ]);
  });

  it('returns row count even when metric values are non-numeric or missing', () => {
    const result = aggregator.aggregate(
      [
        { line: 'A', output: 10 },
        { line: 'A', output: 'N/A' },
        { line: 'A' },
      ],
      createConfig({ aggregation: 'count' })
    );

    expect(result).toEqual([
      {
        name: 'output',
        data: [{ category: 'A', value: 3 }],
      },
    ]);
  });

  it('returns zero for numeric aggregations when a metric has no usable numeric values', () => {
    const result = aggregator.aggregate(
      [
        { line: 'A', output: 'bad-data' },
        { line: 'A', output: null },
      ],
      createConfig({ aggregation: 'sum' })
    );

    expect(result).toEqual([
      {
        name: 'output',
        data: [{ category: 'A', value: 0 }],
      },
    ]);
  });
});
