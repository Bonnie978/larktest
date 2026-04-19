import type { ChartConfig, AggregatedData, AggregationType } from '@/types/dashboard';

export class DataAggregator {
  aggregate(rawData: any[], config: ChartConfig): AggregatedData[] {
    const { dimension, metrics, aggregation } = config;

    if (!rawData || rawData.length === 0) {
      return metrics.map(metric => ({ name: metric, data: [] }));
    }

    const grouped = this.groupBy(rawData, dimension);

    return metrics.map(metric => ({
      name: metric,
      data: grouped.map(group => ({
        category: String(group.key),
        value: this.applyAggregation(group.values, metric, aggregation),
      })),
    }));
  }

  private groupBy(data: any[], field: string): Array<{ key: any; values: any[] }> {
    const groups = new Map<any, any[]>();
    
    for (const item of data) {
      const key = item[field];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    return Array.from(groups.entries()).map(([key, values]) => ({ key, values }));
  }

  private applyAggregation(values: any[], field: string, type: AggregationType): number {
    const numbers = values
      .map(v => v[field])
      .filter(n => typeof n === 'number');

    if (numbers.length === 0) return 0;

    switch (type) {
      case 'sum':
        return numbers.reduce((a, b) => a + b, 0);
      case 'avg':
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
      case 'count':
        return numbers.length;
      case 'max':
        return Math.max(...numbers);
      case 'min':
        return Math.min(...numbers);
      default:
        return 0;
    }
  }
}
