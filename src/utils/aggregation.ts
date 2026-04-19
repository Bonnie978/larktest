export type AggregationType = "sum" | "avg" | "count" | "max" | "none";

export function aggregate(
  data: any[],
  groupByField: string,
  valueFields: string[],
  aggregation: AggregationType
): any[] {
  if (!data || data.length === 0) return [];

  if (aggregation === "none") {
    return data.map(row => {
      const result: any = { [groupByField]: row[groupByField] };
      valueFields.forEach(field => result[field] = row[field]);
      return result;
    });
  }

  const groups = new Map<string, any[]>();
  data.forEach(row => {
    const key = String(row[groupByField]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });

  return Array.from(groups.entries()).map(([key, rows]) => {
    const result: any = { [groupByField]: key };
    valueFields.forEach(field => {
      const values = rows.map(r => r[field]).filter(v => typeof v === "number");
      if (values.length === 0) {
        result[field] = undefined;
        return;
      }
      switch (aggregation) {
        case "sum":
          result[field] = values.reduce((a, b) => a + b, 0);
          break;
        case "avg":
          result[field] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case "count":
          result[field] = values.length;
          break;
        case "max":
          result[field] = Math.max(...values);
          break;
      }
    });
    return result;
  });
}
