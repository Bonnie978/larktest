import { useMemo } from 'react';
import { useRequest } from './useRequest';
import { getLineProduction, getEquipment, getQualityRecords, getOrders, getDataSourceData } from '@/api';

export function useDataSource(dataSource: string) {
  const { data: lineProduction } = useRequest(getLineProduction);
  const { data: equipment } = useRequest(getEquipment);
  const { data: qualityRecords } = useRequest(getQualityRecords);
  const { data: orders } = useRequest(getOrders);
  const { data: dynamicData } = useRequest(
    () => getDataSourceData(dataSource),
    [dataSource]
  );

  const data = useMemo(() => {
    switch (dataSource) {
      case 'line-production':
      case 'shift-output':
        return lineProduction ?? dynamicData ?? [];
      case 'equipment-oee':
      case 'equipment':
        return equipment ?? dynamicData ?? [];
      case 'quality-defects':
      case 'quality-records':
        return qualityRecords ?? dynamicData ?? [];
      case 'order-delivery':
      case 'work-orders':
        return orders ?? dynamicData ?? [];
      case 'weekly-defects':
        return dynamicData ?? [];
      default:
        return dynamicData ?? [];
    }
  }, [dataSource, lineProduction, equipment, qualityRecords, orders, dynamicData]);

  return data;
}
