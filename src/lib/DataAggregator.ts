import type { AggregationType } from '@/types/dashboard';

interface AggregationConfig {
  data: Record<string, unknown>[];
  dimension: string;
  metrics: string[];
  aggregation: AggregationType;
}

export class DataAggregator {
  static aggregate(config: AggregationConfig): Record<string, unknown>[] {
    const { data, dimension, metrics, aggregation } = config;
    if (!data || data.length === 0) return [];
    if (!dimension || metrics.length === 0) return [];

    if (aggregation === 'none') {
      return data.map(row => {
        const result: Record<string, unknown> = { [dimension]: row[dimension] };
        metrics.forEach(m => { result[m] = row[m]; });
        return result;
      });
    }

    const groups = DataAggregator.groupBy(data, dimension);
    return Object.entries(groups).map(([key, rows]) => {
      const result: Record<string, unknown> = { [dimension]: key };
      metrics.forEach(m => {
        result[m] = DataAggregator.applyAggregation(rows, m, aggregation);
      });
      return result;
    });
  }

  private static groupBy(data: Record<string, unknown>[], key: string): Record<string, Record<string, unknown>[]> {
    return data.reduce((acc, row) => {
      const k = String(row[key] ?? '');
      if (!acc[k]) acc[k] = [];
      acc[k].push(row);
      return acc;
    }, {} as Record<string, Record<string, unknown>[]>);
  }

  private static applyAggregation(rows: Record<string, unknown>[], metric: string, agg: AggregationType): number {
    const nums = rows.map(r => Number(r[metric] ?? 0)).filter(n => !isNaN(n));
    if (nums.length === 0) return 0;
    switch (agg) {
      case 'sum': return nums.reduce((a, b) => a + b, 0);
      case 'avg': return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
      case 'count': return nums.length;
      case 'max': return Math.max(...nums);
      case 'min': return Math.min(...nums);
      default: return nums[0];
    }
  }
}
