// src/lib/__tests__/aggregationEngine.test.ts
import { describe, it, expect } from 'vitest';
import { aggregate } from '../aggregationEngine';

const sampleData = [
  { line: 'A', shift: '白班', output: 100, defects: 5 },
  { line: 'A', shift: '夜班', output: 80, defects: 3 },
  { line: 'B', shift: '白班', output: 120, defects: 8 },
  { line: 'B', shift: '夜班', output: 90, defects: 2 },
  { line: 'C', shift: '白班', output: 110, defects: 4 },
];

describe('aggregate', () => {
  it('groups by field and sums values', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'sum',
    });
    expect(result).toEqual([
      { line: 'A', output: 180 },
      { line: 'B', output: 210 },
      { line: 'C', output: 110 },
    ]);
  });

  it('groups by field and averages values', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'avg',
    });
    expect(result).toEqual([
      { line: 'A', output: 90 },
      { line: 'B', output: 105 },
      { line: 'C', output: 110 },
    ]);
  });

  it('groups by field and counts rows', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'count',
    });
    expect(result).toEqual([
      { line: 'A', output: 2 },
      { line: 'B', output: 2 },
      { line: 'C', output: 1 },
    ]);
  });

  it('groups by field and takes max', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'max',
    });
    expect(result).toEqual([
      { line: 'A', output: 100 },
      { line: 'B', output: 120 },
      { line: 'C', output: 110 },
    ]);
  });

  it('none aggregation passes through raw data with selected fields', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'none',
    });
    expect(result).toEqual([
      { line: 'A', output: 100 },
      { line: 'A', output: 80 },
      { line: 'B', output: 120 },
      { line: 'B', output: 90 },
      { line: 'C', output: 110 },
    ]);
  });

  it('handles multiple value fields', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output', 'defects'],
      aggregation: 'sum',
    });
    expect(result).toEqual([
      { line: 'A', output: 180, defects: 8 },
      { line: 'B', output: 210, defects: 10 },
      { line: 'C', output: 110, defects: 4 },
    ]);
  });

  it('returns empty array for empty input', () => {
    const result = aggregate({
      data: [],
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'sum',
    });
    expect(result).toEqual([]);
  });

  it('handles single row', () => {
    const result = aggregate({
      data: [{ line: 'A', output: 100 }],
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'avg',
    });
    expect(result).toEqual([{ line: 'A', output: 100 }]);
  });
});
