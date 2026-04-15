// src/lib/aggregationEngine.ts

import type { Aggregation } from '@/types/dashboard';

interface AggregateParams {
  data: Record<string, any>[];
  groupByField: string;
  valueFields: string[];
  aggregation: Aggregation;
}

export function aggregate({ data, groupByField, valueFields, aggregation }: AggregateParams): Record<string, any>[] {
  if (data.length === 0) return [];

  if (aggregation === 'none') {
    return data.map((row) => {
      const result: Record<string, any> = { [groupByField]: row[groupByField] };
      valueFields.forEach((f) => { result[f] = row[f]; });
      return result;
    });
  }

  // 分组
  const groups = new Map<string, Record<string, any>[]>();
  for (const row of data) {
    const key = String(row[groupByField]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  // 聚合
  const result: Record<string, any>[] = [];
  for (const [key, rows] of groups) {
    const entry: Record<string, any> = { [groupByField]: key };
    for (const field of valueFields) {
      const values = rows.map((r) => Number(r[field]) || 0);
      switch (aggregation) {
        case 'sum':
          entry[field] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          entry[field] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          entry[field] = values.length;
          break;
        case 'max':
          entry[field] = Math.max(...values);
          break;
      }
    }
    result.push(entry);
  }

  return result;
}
