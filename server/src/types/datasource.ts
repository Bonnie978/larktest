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
