import { lineProductionData, weeklyDefectData } from '../mock/production.js';
import { equipmentList } from '../mock/equipment.js';
import { qualityRecords } from '../mock/quality.js';
import { workOrders } from '../mock/orders.js';

export interface FieldMeta {
  key: string;
  label: string;
  type: 'string' | 'number';
}

export interface DataSourceMeta {
  id: string;
  name: string;
  icon: string;
  fields: FieldMeta[];
}

export interface QueryOptions {
  fields?: string[];
  filters?: Record<string, string>;
}

export class DataSourceRegistry {
  private static dataSources: DataSourceMeta[] = [
    {
      id: 'line-production',
      name: '产线数据',
      icon: '🏭',
      fields: [
        { key: 'lineId', label: '产线ID', type: 'string' },
        { key: 'lineName', label: '产线名称', type: 'string' },
        { key: 'shift', label: '班次', type: 'string' },
        { key: 'planned', label: '计划产量', type: 'number' },
        { key: 'actual', label: '实际产量', type: 'number' },
        { key: 'completionRate', label: '完成率', type: 'number' },
        { key: 'status', label: '状态', type: 'string' },
      ],
    },
    {
      id: 'equipment',
      name: '设备数据',
      icon: '⚙️',
      fields: [
        { key: 'id', label: '设备ID', type: 'string' },
        { key: 'name', label: '设备名称', type: 'string' },
        { key: 'lineId', label: '产线ID', type: 'string' },
        { key: 'lineName', label: '产线名称', type: 'string' },
        { key: 'type', label: '设备类型', type: 'string' },
        { key: 'availability', label: '可用率', type: 'number' },
        { key: 'performance', label: '性能率', type: 'number' },
        { key: 'quality', label: '质量率', type: 'number' },
        { key: 'oee', label: 'OEE', type: 'number' },
        { key: 'status', label: '状态', type: 'string' },
      ],
    },
    {
      id: 'quality',
      name: '质量数据',
      icon: '🔍',
      fields: [
        { key: 'id', label: '记录ID', type: 'string' },
        { key: 'batchNo', label: '批次号', type: 'string' },
        { key: 'lineId', label: '产线ID', type: 'string' },
        { key: 'lineName', label: '产线名称', type: 'string' },
        { key: 'defectType', label: '缺陷类型', type: 'string' },
        { key: 'defectCount', label: '缺陷数量', type: 'number' },
        { key: 'inspector', label: '检验员', type: 'string' },
        { key: 'occurTime', label: '发生时间', type: 'string' },
        { key: 'status', label: '处理状态', type: 'string' },
        { key: 'description', label: '描述', type: 'string' },
        { key: 'resolution', label: '处理措施', type: 'string' },
      ],
    },
    {
      id: 'orders',
      name: '工单数据',
      icon: '📋',
      fields: [
        { key: 'id', label: '工单ID', type: 'string' },
        { key: 'productModel', label: '产品型号', type: 'string' },
        { key: 'customer', label: '客户', type: 'string' },
        { key: 'plannedQty', label: '计划数量', type: 'number' },
        { key: 'completedQty', label: '完成数量', type: 'number' },
        { key: 'plannedStart', label: '计划开始', type: 'string' },
        { key: 'plannedEnd', label: '计划结束', type: 'string' },
        { key: 'actualEnd', label: '实际结束', type: 'string' },
        { key: 'deliveryStatus', label: '交付状态', type: 'string' },
      ],
    },
    {
      id: 'weekly-defects',
      name: '周不良数据',
      icon: '📊',
      fields: [
        { key: 'date', label: '日期', type: 'string' },
        { key: 'inspectedQty', label: '检验数量', type: 'number' },
        { key: 'defectQty', label: '不良数量', type: 'number' },
        { key: 'defectRate', label: '不良率', type: 'number' },
        { key: 'mainDefectType', label: '主要缺陷类型', type: 'string' },
      ],
    },
  ];

  private static dataSourceMap: Record<string, any[]> = {
    'line-production': lineProductionData,
    'equipment': equipmentList,
    'quality': qualityRecords,
    'orders': workOrders,
    'weekly-defects': weeklyDefectData,
  };

  static getAllDataSources(): DataSourceMeta[] {
    return this.dataSources;
  }

  static getDataSource(id: string): DataSourceMeta | undefined {
    return this.dataSources.find((ds) => ds.id === id);
  }

  static async getData(dataSourceId: string, options: QueryOptions = {}): Promise<any[]> {
    const data = this.dataSourceMap[dataSourceId];
    
    if (!data) {
      throw new Error(`Data source not found: ${dataSourceId}`);
    }

    let result = [...data];

    // Apply filters (exact match)
    if (options.filters && Object.keys(options.filters).length > 0) {
      result = result.filter((row) => {
        return Object.entries(options.filters!).every(([key, value]) => {
          return String(row[key]) === String(value);
        });
      });
    }

    // Apply field projection
    if (options.fields && options.fields.length > 0) {
      result = result.map((row) => {
        const projected: any = {};
        options.fields!.forEach((field) => {
          if (field in row) {
            projected[field] = row[field];
          }
        });
        return projected;
      });
    }

    return result;
  }
}
