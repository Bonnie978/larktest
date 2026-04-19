export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'date';
  label: string;
}

export interface DataSourceMeta {
  id: string;
  name: string;
  description: string;
  fields: DataSourceField[];
}
