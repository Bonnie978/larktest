import type { ChartConfig, AggregatedData, AggregationType } from '@/types/dashboard';

const EMPTY_DIMENSION_LABEL = '未分组';

export class DataAggregator {
  aggregate(rawData: any[], config: ChartConfig): AggregatedData[] {
    const { dimension, metrics, aggregation } = config;

    if (!Array.isArray(rawData) || rawData.length === 0 || metrics.length === 0) {
      return metrics.map(metric => ({ name: metric, data: [] }));
    }

    const grouped = this.groupBy(rawData, dimension);

    return metrics.map(metric => ({
      name: metric,
      data: grouped.map(group => ({
        category: group.key,
        value: this.applyAggregation(group.values, metric, aggregation),
      })),
    }));
  }

  private groupBy(data: any[], field: string): Array<{ key: string; values: any[] }> {
    const groups = new Map<string, any[]>();

    for (const item of data) {
      const key = this.normalizeDimensionValue(item?.[field]);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    return Array.from(groups.entries()).map(([key, values]) => ({ key, values }));
  }

  private normalizeDimensionValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return EMPTY_DIMENSION_LABEL;
    }

    return String(value);
  }

  private getNumericValues(values: any[], field: string): number[] {
    return values
      .map(value => {
        const rawValue = value?.[field];
        if (typeof rawValue === 'number') {
          return Number.isFinite(rawValue) ? rawValue : null;
        }

        if (typeof rawValue === 'string' && rawValue.trim() !== '') {
          const parsed = Number(rawValue);
          return Number.isFinite(parsed) ? parsed : null;
        }

        return null;
      })
      .filter((value): value is number => value !== null);
  }

  private applyAggregation(values: any[], field: string, type: AggregationType): number {
    if (type === 'count') {
      return values.length;
    }

    const numbers = this.getNumericValues(values, field);

    if (numbers.length === 0) {
      return 0;
    }

    switch (type) {
      case 'sum':
        return numbers.reduce((a, b) => a + b, 0);
      case 'avg':
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
      case 'max':
        return Math.max(...numbers);
      case 'min':
        return Math.min(...numbers);
      default:
        return 0;
    }
  }
}
