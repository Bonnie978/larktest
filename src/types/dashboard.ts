export type ChartType = 'bar' | 'line' | 'pie' | 'table' | 'kpi';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface CardConfig {
  dataSourceId: string;
  chartType: ChartType;
  xField?: string;
  yField?: string;
  aggregation?: AggregationType;
  filters?: Record<string, string>;
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardCard {
  id: string;
  title: string;
  config: CardConfig;
  position: GridPosition;
}

export interface DashboardState {
  cards: DashboardCard[];
}
