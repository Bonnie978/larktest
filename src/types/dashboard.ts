export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'none';

export type ChartType = 'bar' | 'line' | 'pie';

export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: ChartType;
  groupByField: string;
  valueFields: string[];
  aggregation: AggregationType;
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CardItem {
  config: CardConfig;
  grid: GridPosition;
}

export interface DashboardState {
  version: 2;
  cards: CardItem[];
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
