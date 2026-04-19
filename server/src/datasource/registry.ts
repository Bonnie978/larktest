import { lineProductionData, weeklyDefectData } from '../mock/production.js';
import { qualityRecords } from '../mock/quality.js';
import { equipmentList } from '../mock/equipment.js';
import { workOrders } from '../mock/orders.js';

interface FieldMeta {
  key: string;
  label: string;
  type: 'string' | 'number';
}

interface DataSourceDefinition {
  id: string;
  name: string;
  fields: FieldMeta[];
  getData: () => Record<string, unknown>[];
}

class DataSourceRegistry {
  private sources = new Map<string, DataSourceDefinition>();

  register(def: DataSourceDefinition): void {
    this.sources.set(def.id, def);
  }

  getAll(): { id: string; name: string; fields: FieldMeta[] }[] {
    return Array.from(this.sources.values()).map(({ id, name, fields }) => ({
      id,
      name,
      fields,
    }));
  }

  getById(id: string): DataSourceDefinition | undefined {
    return this.sources.get(id);
  }

  queryData(
    id: string,
    options?: { fields?: string[]; filters?: Record<string, string> }
  ): Record<string, unknown>[] | null {
    const source = this.sources.get(id);
    if (!source) return null;

    let data = source.getData();

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        data = data.filter((row) => String(row[key]) === value);
      }
    }

    if (options?.fields && options.fields.length > 0) {
      const fieldSet = new Set(options.fields);
      data = data.map((row) => {
        const result: Record<string, unknown> = {};
        for (const key of fieldSet) {
          if (key in row) result[key] = row[key];
        }
        return result;
      });
    }

    return data;
  }
}

const registry = new DataSourceRegistry();

registry.register({
  id: 'line-production',
  name: '产线产量',
  fields: [
    { key: 'lineName', label: '产线名称', type: 'string' },
    { key: 'shift', label: '班次', type: 'string' },
    { key: 'planned', label: '计划产量', type: 'number' },
    { key: 'actual', label: '实际产量', type: 'number' },
    { key: 'completionRate', label: '完成率', type: 'number' },
  ],
  getData: () => lineProductionData as unknown as Record<string, unknown>[],
});

registry.register({
  id: 'weekly-defects',
  name: '周不良数据',
  fields: [
    { key: 'date', label: '日期', type: 'string' },
    { key: 'inspectedQty', label: '检验数量', type: 'number' },
    { key: 'defectQty', label: '不良数', type: 'number' },
    { key: 'defectRate', label: '不良率', type: 'number' },
    { key: 'mainDefectType', label: '主要不良类型', type: 'string' },
  ],
  getData: () => weeklyDefectData as unknown as Record<string, unknown>[],
});

registry.register({
  id: 'quality',
  name: '质量记录',
  fields: [
    { key: 'lineName', label: '产线名称', type: 'string' },
    { key: 'defectType', label: '不良类型', type: 'string' },
    { key: 'defectCount', label: '不良数量', type: 'number' },
    { key: 'inspector', label: '检验员', type: 'string' },
    { key: 'status', label: '状态', type: 'string' },
  ],
  getData: () => qualityRecords as unknown as Record<string, unknown>[],
});

registry.register({
  id: 'equipment',
  name: '设备数据',
  fields: [
    { key: 'name', label: '设备名称', type: 'string' },
    { key: 'lineName', label: '产线名称', type: 'string' },
    { key: 'type', label: '设备类型', type: 'string' },
    { key: 'status', label: '状态', type: 'string' },
    { key: 'availability', label: '可用率', type: 'number' },
    { key: 'performance', label: '性能率', type: 'number' },
    { key: 'quality', label: '良品率', type: 'number' },
    { key: 'oee', label: 'OEE', type: 'number' },
  ],
  getData: () => equipmentList as unknown as Record<string, unknown>[],
});

registry.register({
  id: 'orders',
  name: '工单数据',
  fields: [
    { key: 'productModel', label: '产品型号', type: 'string' },
    { key: 'customer', label: '客户', type: 'string' },
    { key: 'deliveryStatus', label: '交付状态', type: 'string' },
    { key: 'plannedQty', label: '计划数量', type: 'number' },
    { key: 'completedQty', label: '完成数量', type: 'number' },
  ],
  getData: () => workOrders as unknown as Record<string, unknown>[],
});

export default registry;
