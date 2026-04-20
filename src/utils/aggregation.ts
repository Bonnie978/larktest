import type { AggregationType } from '@/types/dashboard';

/**
 * 聚合数据函数
 * @param rawData 原始数据数组
 * @param groupByField 分组字段（维度）
 * @param valueFields 数值字段数组（指标）
 * @param aggregation 聚合方式
 * @returns 聚合后的数据数组
 */
export function aggregateData(
  rawData: Record<string, any>[],
  groupByField: string,
  valueFields: string[],
  aggregation: AggregationType
): Record<string, any>[] {
  if (!rawData || rawData.length === 0) return [];
  if (!groupByField || valueFields.length === 0) return [];

  // 按 groupByField 分组
  const groups = new Map<string, Record<string, any>[]>();
  
  for (const row of rawData) {
    const key = String(row[groupByField] ?? '');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  }

  // 对每组进行聚合
  const result: Record<string, any>[] = [];

  for (const [groupKey, records] of groups.entries()) {
    const aggregated: Record<string, any> = {
      [groupByField]: groupKey,
    };

    if (aggregation === 'sum') {
      // 求和
      for (const field of valueFields) {
        aggregated[field] = records.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
      }
    } else if (aggregation === 'avg') {
      // 平均值
      for (const field of valueFields) {
        const sum = records.reduce((s, r) => s + (Number(r[field]) || 0), 0);
        aggregated[field] = records.length > 0 ? sum / records.length : 0;
      }
    } else if (aggregation === 'count') {
      // 计数
      for (const field of valueFields) {
        aggregated[field] = records.length;
      }
    } else if (aggregation === 'max') {
      // 最大值
      for (const field of valueFields) {
        aggregated[field] = Math.max(...records.map(r => Number(r[field]) || 0));
      }
    }

    result.push(aggregated);
  }

  return result;
}
