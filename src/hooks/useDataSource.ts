import { useMemo } from 'react';
import { useRequest } from './useRequest';
import { getDataSourceData } from '@/api';
import type { DataSourceType } from '@/types/dashboard';

export function useDataSource(dataSource: DataSourceType) {
  const { data } = useRequest(() => getDataSourceData(dataSource), [dataSource]);
  
  return useMemo(() => data ?? [], [data]);
}
