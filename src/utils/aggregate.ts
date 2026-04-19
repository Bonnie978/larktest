/**
 * 前端聚合计算引擎
 * 支持 none/sum/avg/count/max 五种聚合方式
 */

export type AggregationType = 'none' | 'sum' | 'avg' | 'count' | 'max';

export interface AggregateParams {
  data: Record<string, unknown>[];
  groupByField: string;
  valueFields: string[];
  aggregation: AggregationType;
}

/**
 * 按 groupByField 分组并对 valueFields 执行聚合计算
 */
export function aggregate(params: AggregateParams): Record<string, unknown>[] {
  const { data, groupByField, valueFields, aggregation } = params;

  if (!data || data.length === 0 || !groupByField) {
    return [];
  }

  // none: 不聚合，仅投影 groupByField + valueFields，保留原始行序
  if (aggregation === 'none') {
    return data.map((row) => {
      const result: Record<string, unknown> = { [groupByField]: row[groupByField] };
      valueFields.forEach((f) => {
        result[f] = row[f];
      });
      return result;
    });
  }

  // 分组
  const groups: Record<string, Record<string, unknown>[]> = {};
  data.forEach((row) => {
    const key = String(row[groupByField] ?? '');
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });

  return Object.entries(groups).map(([key, rows]) => {
    const result: Record<string, unknown> = { [groupByField]: key };

    if (valueFields.length === 0) {
      return result;
    }

    valueFields.forEach((field) => {
      const values = rows
        .map((r) => {
          const v = r[field];
          return typeof v === 'number' ? v : 0; // 非数值视为 0
        });

      switch (aggregation) {
        case 'sum':
          result[field] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[field] =
            values.length > 0
              ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
              : 0;
          break;
        case 'count':
          result[field] = rows.length;
          break;
        case 'max':
          result[field] = values.length > 0 ? Math.max(...values) : 0;
          break;
        default:
          result[field] = 0;
      }
    });

    return result;
  });
}

export default aggregate;
