import type { AggregationType } from '@/types/dashboard';

interface AggregateParams {
  data: Record<string, unknown>[];
  groupByField: string;
  valueFields: string[];
  aggregation: AggregationType;
}

export function aggregate(params: AggregateParams): Record<string, unknown>[] {
  const { data, groupByField, valueFields, aggregation } = params;

  if (!data || data.length === 0) return [];
  if (!groupByField) return [];

  if (aggregation === 'none') {
    return data.map((row) => {
      const result: Record<string, unknown> = { [groupByField]: row[groupByField] };
      valueFields.forEach((f) => {
        result[f] = row[f];
      });
      return result;
    });
  }

  // Group by
  const groups = new Map<string, Record<string, unknown>[]>();
  data.forEach((row) => {
    const key = String(row[groupByField] ?? '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });

  const result: Record<string, unknown>[] = [];
  groups.forEach((rows, key) => {
    const entry: Record<string, unknown> = { [groupByField]: key };
    valueFields.forEach((f) => {
      const nums = rows.map((r) => {
        const v = Number(r[f]);
        return isNaN(v) ? 0 : v;
      });
      switch (aggregation) {
        case 'sum':
          entry[f] = nums.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          entry[f] = nums.length > 0
            ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100
            : 0;
          break;
        case 'count':
          entry[f] = rows.length;
          break;
        case 'max':
          entry[f] = nums.length > 0 ? Math.max(...nums) : 0;
          break;
      }
    });
    result.push(entry);
  });

  return result;
}
