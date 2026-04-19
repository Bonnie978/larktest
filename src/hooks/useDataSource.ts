import { useMemo } from 'react';
import { useRequest } from './useRequest';
import { getLineProduction, getEquipment, getQualityRecords, getOrders } from '@/api';
import type { DataSourceType } from '@/types/dashboard';

export function useDataSource(dataSource: DataSourceType) {
  const { data: lineProduction } = useRequest(getLineProduction);
  const { data: equipment } = useRequest(getEquipment);
  const { data: qualityRecords } = useRequest(getQualityRecords);
  const { data: orders } = useRequest(getOrders);

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
      default:
        return [];
    }
  }, [dataSource, lineProduction, equipment, qualityRecords, orders]);

  return data;
}
