export type ChartType = 'bar' | 'line' | 'pie';

export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'none';

export type BuilderMode = 'create' | 'edit';

export interface DataSourceField {
  key: string;
  label: string;
  type: 'string' | 'number';
}

export interface DataSourceMeta {
  id: string;
  name: string;
  fields: DataSourceField[];
}

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

export interface DashboardCard {
  config: CardConfig;
  grid: GridPosition;
}

export interface DashboardLayout {
  version: 2;
  cards: DashboardCard[];
}

export interface BuilderState {
  open: boolean;
  mode: BuilderMode;
  editingCardId: string | null;
}
