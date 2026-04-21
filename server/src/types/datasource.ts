export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'date';
  label: string;
}

export interface DimensionOrMetric {
  field: string;
  label: string;
}

export interface DataSourceMeta {
  id: string;
  name: string;
  description: string;
  fields: DataSourceField[];
  dimensions: DimensionOrMetric[];
  metrics: DimensionOrMetric[];
}
