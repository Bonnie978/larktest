import { useCallback } from 'react';
import { useRequest } from './useRequest';
import { getDataSourceData } from '@/api';
import type { DataSourceType } from '@/types/dashboard';

export function useDataSource(dataSource: DataSourceType) {
  const fetcher = useCallback(() => getDataSourceData(dataSource), [dataSource]);
  const { data } = useRequest(fetcher, [dataSource]);
  return data ?? [];
}
