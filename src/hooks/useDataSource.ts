import { useMemo } from 'react';
import { useRequest } from './useRequest';
import { getLineProduction, getEquipment, getQualityRecords, getOrders, getWeeklyDefects } from '@/api';
import type { DataSourceType } from '@/types/dashboard';

export function useDataSource(dataSource: DataSourceType) {
  const { data: lineProduction } = useRequest(getLineProduction);
  const { data: equipment } = useRequest(getEquipment);
  const { data: qualityRecords } = useRequest(getQualityRecords);
  const { data: orders } = useRequest(getOrders);
  const { data: weeklyDefects } = useRequest(getWeeklyDefects);

  const data = useMemo(() => {
    switch (dataSource) {
      case 'line-production':
      case 'shift-output':
        return lineProduction ?? [];
      case 'equipment-oee':
        return equipment ?? [];
      case 'quality-defects':
        return qualityRecords ?? [];
      case 'order-delivery':
        return orders ?? [];
      case 'weekly-defects':
        return weeklyDefects ?? [];
      default:
        return [];
    }
  }, [dataSource, lineProduction, equipment, qualityRecords, orders, weeklyDefects]);

  return data;
}
