import type { AggregationType } from '@/types/dashboard';

export function aggregate(
  data: Record<string, any>[],
  groupByField: string,
  valueFields: string[],
  aggregation: AggregationType
): Record<string, any>[] {
  if (data.length === 0) return [];

  if (aggregation === 'none') {
    return data.map((row) => {
      const result: Record<string, any> = { [groupByField]: row[groupByField] };
      valueFields.forEach((f) => {
        result[f] = row[f];
      });
      return result;
    });
  }

  const groups = new Map<string, Record<string, any>[]>();
  data.forEach((row) => {
    const key = String(row[groupByField] ?? '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });

  const result: Record<string, any>[] = [];
  groups.forEach((rows, groupKey) => {
    const aggregated: Record<string, any> = { [groupByField]: groupKey };

    valueFields.forEach((field) => {
      const values = rows.map((r) => Number(r[field]) || 0);

      switch (aggregation) {
        case 'sum':
          aggregated[field] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregated[field] =
            values.length > 0
              ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
              : 0;
          break;
        case 'count':
          aggregated[field] = rows.length;
          break;
        case 'max':
          aggregated[field] = Math.max(...values);
          break;
      }
    });

    result.push(aggregated);
  });

  return result;
}
