import { lineProductionData, weeklyDefectData } from '../mock/production.js';
import { equipmentList } from '../mock/equipment.js';
import { qualityRecords } from '../mock/quality.js';
import { workOrders } from '../mock/orders.js';

export interface QueryOptions {
  fields?: string[];
  filters?: Record<string, string>;
}

export class QueryEngine {
  private static dataSourceMap: Record<string, any[]> = {
    'line-production': lineProductionData,
    'equipment': equipmentList,
    'quality': qualityRecords,
    'orders': workOrders,
    'weekly-defects': weeklyDefectData,
  };

  static async query(dataSourceId: string, options: QueryOptions = {}): Promise<any[]> {
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
