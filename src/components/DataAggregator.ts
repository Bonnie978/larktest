export type AggregationType = 'none' | 'sum' | 'avg' | 'count' | 'max' | 'min';

export interface AggregationConfig {
  data: any[];
  dimension: string;
  metrics: string[];
  aggregation: AggregationType;
}

export class DataAggregator {
  static aggregate(config: AggregationConfig): any[] {
    const { data, dimension, metrics, aggregation } = config;

    if (!data || data.length === 0 || !dimension || metrics.length === 0) {
      return [];
    }

    if (aggregation === 'none') {
      return data.map((row) => {
        const result: any = { [dimension]: row[dimension] };
        metrics.forEach((m) => {
          result[m] = row[m];
        });
        return result;
      });
    }

    const groups = DataAggregator.groupBy(data, dimension);

    return Object.entries(groups).map(([key, rows]) => {
      const result: any = { [dimension]: key };
      metrics.forEach((m) => {
        result[m] = DataAggregator.applyAggregation(rows, m, aggregation);
      });
      return result;
    });
  }

  private static groupBy(data: any[], key: string): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    data.forEach((row) => {
      const groupKey = String(row[key] ?? '');
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(row);
    });
    return groups;
  }

  private static applyAggregation(
    rows: any[],
    metric: string,
    agg: AggregationType
  ): number {
    const values = rows
      .map((r) => r[metric])
      .filter((v) => typeof v === 'number');

    if (values.length === 0) return 0;

    switch (agg) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      default:
        return 0;
    }
  }
}

export default DataAggregator;
