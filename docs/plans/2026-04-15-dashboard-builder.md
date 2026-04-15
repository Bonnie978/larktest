# 自助式可视化仪表盘实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让用户能选择数据源→勾选字段→选聚合方式→选图表类型→生成图表卡片，并通过拖拽自由编排看板布局。

**Architecture:** 后端新增通用数据源查询 API（`/api/datasource`），前端构建 ChartBuilder 向导式搭建器 + gridstack.js 拖拽看板。聚合计算在前端完成（纯函数 AggregationEngine），看板配置持久化到 localStorage。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts (已装), gridstack.js (新装), Express (后端)

---

## 文件结构

### 新建文件
| 文件 | 职责 |
|------|------|
| `src/types/dashboard.ts` | CardConfig、DashboardLayout、ChartType、Aggregation 等类型定义 |
| `src/config/dataSources.ts` | 数据源元数据注册表（FieldMeta、DataSourceMeta） |
| `src/lib/aggregationEngine.ts` | 纯函数聚合引擎（分组+聚合计算） |
| `src/lib/__tests__/aggregationEngine.test.ts` | 聚合引擎测试 |
| `src/components/ChartBuilder.tsx` | 指标搭建器弹窗（3 步向导） |
| `src/components/DashboardGridStack.tsx` | 基于 gridstack.js 的看板网格（替代旧 DashboardEngine） |
| `src/components/DashboardCardRenderer.tsx` | 看板卡片渲染器（根据 CardConfig 获取数据+聚合+渲染图表） |
| `src/hooks/useDashboardStore.ts` | 看板状态管理 hook（替代旧 useDashboardLayout） |
| `src/hooks/__tests__/useDashboardStore.test.ts` | 看板存储测试 |
| `server/src/routes/datasource.ts` | 后端通用数据源查询路由 |

### 修改文件
| 文件 | 改动 |
|------|------|
| `server/src/index.ts` | 注册 `/api/datasource` 路由 |
| `src/api/index.ts` | 新增 getDataSources、getDataSourceData 函数 |
| `src/pages/Overview.tsx` | 替换为新的 DashboardGridStack + ChartBuilder 集成 |
| `src/components/DashboardToolbar.tsx` | 新增「新建图表」按钮 |
| `package.json` | 添加 gridstack 依赖 |

### 删除文件（被替代）
| 文件 | 原因 |
|------|------|
| `src/components/DashboardEngine.tsx` | 被 DashboardGridStack 替代 |
| `src/components/IndicatorLibrary.tsx` | 被 ChartBuilder 替代 |
| `src/components/indicators.ts` | 被 dataSources.ts + aggregationEngine 替代 |
| `src/hooks/useDashboardLayout.ts` | 被 useDashboardStore 替代 |

---

## Task 1: 类型定义

**Files:**
- Create: `src/types/dashboard.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/types/dashboard.ts

export type ChartType = 'bar' | 'line' | 'pie' | 'number' | 'table';
export type Aggregation = 'sum' | 'avg' | 'count' | 'max' | 'none';

export interface FieldMeta {
  key: string;
  label: string;
  type: 'string' | 'number';
  description?: string;
}

export interface DataSourceMeta {
  id: string;
  name: string;
  icon: string;
  fields: FieldMeta[];
}

export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: ChartType;
  groupByField: string;
  valueFields: string[];
  aggregation: Aggregation;
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardCard {
  config: CardConfig;
  grid: GridPosition;
}

export interface DashboardLayout {
  version: 2;
  cards: DashboardCard[];
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/types/dashboard.ts
git commit -m "feat: 添加仪表盘类型定义 (CardConfig, DashboardLayout)"
```

---

## Task 2: 聚合引擎（TDD）

**Files:**
- Create: `src/lib/aggregationEngine.ts`
- Create: `src/lib/__tests__/aggregationEngine.test.ts`

- [ ] **Step 1: 写测试文件**

```typescript
// src/lib/__tests__/aggregationEngine.test.ts
import { describe, it, expect } from 'vitest';
import { aggregate } from '../aggregationEngine';

const sampleData = [
  { line: 'A', shift: '白班', output: 100, defects: 5 },
  { line: 'A', shift: '夜班', output: 80, defects: 3 },
  { line: 'B', shift: '白班', output: 120, defects: 8 },
  { line: 'B', shift: '夜班', output: 90, defects: 2 },
  { line: 'C', shift: '白班', output: 110, defects: 4 },
];

describe('aggregate', () => {
  it('groups by field and sums values', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'sum',
    });
    expect(result).toEqual([
      { line: 'A', output: 180 },
      { line: 'B', output: 210 },
      { line: 'C', output: 110 },
    ]);
  });

  it('groups by field and averages values', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'avg',
    });
    expect(result).toEqual([
      { line: 'A', output: 90 },
      { line: 'B', output: 105 },
      { line: 'C', output: 110 },
    ]);
  });

  it('groups by field and counts rows', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'count',
    });
    expect(result).toEqual([
      { line: 'A', output: 2 },
      { line: 'B', output: 2 },
      { line: 'C', output: 1 },
    ]);
  });

  it('groups by field and takes max', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'max',
    });
    expect(result).toEqual([
      { line: 'A', output: 100 },
      { line: 'B', output: 120 },
      { line: 'C', output: 110 },
    ]);
  });

  it('none aggregation passes through raw data with selected fields', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'none',
    });
    expect(result).toEqual([
      { line: 'A', output: 100 },
      { line: 'A', output: 80 },
      { line: 'B', output: 120 },
      { line: 'B', output: 90 },
      { line: 'C', output: 110 },
    ]);
  });

  it('handles multiple value fields', () => {
    const result = aggregate({
      data: sampleData,
      groupByField: 'line',
      valueFields: ['output', 'defects'],
      aggregation: 'sum',
    });
    expect(result).toEqual([
      { line: 'A', output: 180, defects: 8 },
      { line: 'B', output: 210, defects: 10 },
      { line: 'C', output: 110, defects: 4 },
    ]);
  });

  it('returns empty array for empty input', () => {
    const result = aggregate({
      data: [],
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'sum',
    });
    expect(result).toEqual([]);
  });

  it('handles single row', () => {
    const result = aggregate({
      data: [{ line: 'A', output: 100 }],
      groupByField: 'line',
      valueFields: ['output'],
      aggregation: 'avg',
    });
    expect(result).toEqual([{ line: 'A', output: 100 }]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/lib/__tests__/aggregationEngine.test.ts`
Expected: FAIL — cannot find module '../aggregationEngine'

- [ ] **Step 3: 实现聚合引擎**

```typescript
// src/lib/aggregationEngine.ts
import type { Aggregation } from '@/types/dashboard';

interface AggregateParams {
  data: Record<string, any>[];
  groupByField: string;
  valueFields: string[];
  aggregation: Aggregation;
}

export function aggregate({ data, groupByField, valueFields, aggregation }: AggregateParams): Record<string, any>[] {
  if (data.length === 0) return [];

  if (aggregation === 'none') {
    return data.map((row) => {
      const result: Record<string, any> = { [groupByField]: row[groupByField] };
      valueFields.forEach((f) => { result[f] = row[f]; });
      return result;
    });
  }

  // 分组
  const groups = new Map<string, Record<string, any>[]>();
  for (const row of data) {
    const key = String(row[groupByField]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  // 聚合
  const result: Record<string, any>[] = [];
  for (const [key, rows] of groups) {
    const entry: Record<string, any> = { [groupByField]: key };
    for (const field of valueFields) {
      const values = rows.map((r) => Number(r[field]) || 0);
      switch (aggregation) {
        case 'sum':
          entry[field] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          entry[field] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          entry[field] = values.length;
          break;
        case 'max':
          entry[field] = Math.max(...values);
          break;
      }
    }
    result.push(entry);
  }

  return result;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/lib/__tests__/aggregationEngine.test.ts`
Expected: 8 tests PASS

- [ ] **Step 5: 提交**

```bash
git add src/lib/aggregationEngine.ts src/lib/__tests__/aggregationEngine.test.ts
git commit -m "feat: 添加前端聚合引擎 (sum/avg/count/max/none)"
```

---

## Task 3: 数据源注册表

**Files:**
- Create: `src/config/dataSources.ts`

- [ ] **Step 1: 创建数据源注册表**

```typescript
// src/config/dataSources.ts
import type { DataSourceMeta } from '@/types/dashboard';

export const DATA_SOURCES: DataSourceMeta[] = [
  {
    id: 'line-production',
    name: '产线数据',
    icon: '🏭',
    fields: [
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'shift', label: '班次', type: 'string' },
      { key: 'planned', label: '计划产量', type: 'number' },
      { key: 'actual', label: '实际产量', type: 'number' },
      { key: 'completionRate', label: '完成率', type: 'number', description: '百分比' },
    ],
  },
  {
    id: 'equipment',
    name: '设备数据',
    icon: '⚙️',
    fields: [
      { key: 'name', label: '设备名称', type: 'string' },
      { key: 'lineName', label: '所属产线', type: 'string' },
      { key: 'type', label: '设备类型', type: 'string' },
      { key: 'status', label: '状态', type: 'string' },
      { key: 'availability', label: '稼动率', type: 'number' },
      { key: 'performance', label: '性能率', type: 'number' },
      { key: 'quality', label: '良品率', type: 'number' },
      { key: 'oee', label: 'OEE', type: 'number', description: '综合设备效率' },
    ],
  },
  {
    id: 'quality',
    name: '质量数据',
    icon: '🔍',
    fields: [
      { key: 'lineName', label: '产线', type: 'string' },
      { key: 'defectType', label: '不良类型', type: 'string' },
      { key: 'inspector', label: '检验员', type: 'string' },
      { key: 'status', label: '处理状态', type: 'string' },
      { key: 'defectCount', label: '不良数量', type: 'number' },
    ],
  },
  {
    id: 'orders',
    name: '工单数据',
    icon: '📋',
    fields: [
      { key: 'productModel', label: '产品型号', type: 'string' },
      { key: 'customer', label: '客户名称', type: 'string' },
      { key: 'deliveryStatus', label: '交期状态', type: 'string' },
      { key: 'plannedQty', label: '计划数量', type: 'number' },
      { key: 'completedQty', label: '已完成数量', type: 'number' },
    ],
  },
  {
    id: 'weekly-defects',
    name: '不良趋势(周)',
    icon: '📈',
    fields: [
      { key: 'date', label: '日期', type: 'string' },
      { key: 'mainDefectType', label: '主要不良类型', type: 'string' },
      { key: 'inspectedQty', label: '检验数量', type: 'number' },
      { key: 'defectQty', label: '不良数', type: 'number' },
      { key: 'defectRate', label: '不良率', type: 'number' },
    ],
  },
];

export function getDataSourceMeta(id: string): DataSourceMeta | undefined {
  return DATA_SOURCES.find((ds) => ds.id === id);
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/config/dataSources.ts
git commit -m "feat: 添加数据源元数据注册表 (5 个数据源)"
```

---

## Task 4: 后端通用数据源 API

**Files:**
- Create: `server/src/routes/datasource.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建数据源路由**

```typescript
// server/src/routes/datasource.ts
import { Router } from 'express';
import type { Request, Response } from 'express';
import { lineProductionData, weeklyDefectData } from '../mock/production.js';
import { equipmentList } from '../mock/equipment.js';
import { qualityRecords } from '../mock/quality.js';
import { workOrders } from '../mock/orders.js';

const router = Router();

// 数据源 → mock 数据映射
const dataMap: Record<string, any[]> = {
  'line-production': lineProductionData,
  'equipment': equipmentList,
  'quality': qualityRecords,
  'orders': workOrders,
  'weekly-defects': weeklyDefectData,
};

// 数据源元数据（与前端 dataSources.ts 保持一致）
const metaMap: Record<string, { id: string; name: string; fields: { key: string; label: string; type: string }[] }> = {
  'line-production': {
    id: 'line-production', name: '产线数据',
    fields: [
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'shift', label: '班次', type: 'string' },
      { key: 'planned', label: '计划产量', type: 'number' },
      { key: 'actual', label: '实际产量', type: 'number' },
      { key: 'completionRate', label: '完成率', type: 'number' },
    ],
  },
  'equipment': {
    id: 'equipment', name: '设备数据',
    fields: [
      { key: 'name', label: '设备名称', type: 'string' },
      { key: 'lineName', label: '所属产线', type: 'string' },
      { key: 'type', label: '设备类型', type: 'string' },
      { key: 'status', label: '状态', type: 'string' },
      { key: 'availability', label: '稼动率', type: 'number' },
      { key: 'performance', label: '性能率', type: 'number' },
      { key: 'quality', label: '良品率', type: 'number' },
      { key: 'oee', label: 'OEE', type: 'number' },
    ],
  },
  'quality': {
    id: 'quality', name: '质量数据',
    fields: [
      { key: 'lineName', label: '产线', type: 'string' },
      { key: 'defectType', label: '不良类型', type: 'string' },
      { key: 'inspector', label: '检验员', type: 'string' },
      { key: 'status', label: '处理状态', type: 'string' },
      { key: 'defectCount', label: '不良数量', type: 'number' },
    ],
  },
  'orders': {
    id: 'orders', name: '工单数据',
    fields: [
      { key: 'productModel', label: '产品型号', type: 'string' },
      { key: 'customer', label: '客户名称', type: 'string' },
      { key: 'deliveryStatus', label: '交期状态', type: 'string' },
      { key: 'plannedQty', label: '计划数量', type: 'number' },
      { key: 'completedQty', label: '已完成数量', type: 'number' },
    ],
  },
  'weekly-defects': {
    id: 'weekly-defects', name: '不良趋势(周)',
    fields: [
      { key: 'date', label: '日期', type: 'string' },
      { key: 'mainDefectType', label: '主要不良类型', type: 'string' },
      { key: 'inspectedQty', label: '检验数量', type: 'number' },
      { key: 'defectQty', label: '不良数', type: 'number' },
      { key: 'defectRate', label: '不良率', type: 'number' },
    ],
  },
};

// GET /api/datasource — 返回所有数据源元数据
router.get('/', (_req: Request, res: Response) => {
  const list = Object.values(metaMap);
  res.json({ code: 0, data: list, message: 'success' });
});

// GET /api/datasource/:id/data — 返回数据（支持字段投影+等值筛选）
router.get('/:id/data', (req: Request, res: Response) => {
  const { id } = req.params;
  const { fields, ...filters } = req.query;

  let data = dataMap[id];
  if (!data) {
    res.status(404).json({ code: 1, data: null, message: `数据源 ${id} 不存在` });
    return;
  }

  // 拷贝避免修改原始数据
  data = [...data];

  // 等值筛选
  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === 'string') {
      data = data.filter((row: any) => String(row[key]) === value);
    }
  }

  // 字段投影
  if (typeof fields === 'string' && fields.length > 0) {
    const fieldList = fields.split(',').map((f) => f.trim());
    data = data.map((row: any) => {
      const result: Record<string, any> = {};
      fieldList.forEach((f) => { if (f in row) result[f] = row[f]; });
      return result;
    });
  }

  res.json({ code: 0, data, message: 'success' });
});

export default router;
```

- [ ] **Step 2: 注册路由到 server/src/index.ts**

在 `server/src/index.ts` 现有的 import 和 app.use 下面添加：

```typescript
// 在 import 区域添加
import datasourceRouter from './routes/datasource.js';

// 在 app.use 区域添加
app.use('/api/datasource', datasourceRouter);
```

- [ ] **Step 3: 验证后端启动**

Run: `cd server && npx tsx src/index.ts &`
然后: `curl -s http://localhost:3001/api/datasource | head -100`
Expected: 返回 5 个数据源元数据的 JSON

再验证: `curl -s 'http://localhost:3001/api/datasource/equipment/data?fields=name,oee' | head -100`
Expected: 仅返回 name 和 oee 两个字段

- [ ] **Step 4: 提交**

```bash
git add server/src/routes/datasource.ts server/src/index.ts
git commit -m "feat: 后端新增通用数据源查询 API (/api/datasource)"
```

---

## Task 5: 前端 API 新增

**Files:**
- Modify: `src/api/index.ts`

- [ ] **Step 1: 在 src/api/index.ts 末尾添加**

```typescript
import type { DataSourceMeta } from '@/types/dashboard';

// 数据源通用查询
export const getDataSources = () => request<DataSourceMeta[]>('/datasource');
export const getDataSourceData = (id: string, params?: Record<string, string>) =>
  request<Record<string, any>[]>(`/datasource/${id}/data`, params);
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/api/index.ts
git commit -m "feat: 前端新增 getDataSources/getDataSourceData API"
```

---

## Task 6: 安装 gridstack.js 并创建 DashboardGridStack

**Files:**
- Modify: `package.json` (npm install)
- Create: `src/components/DashboardGridStack.tsx`

- [ ] **Step 1: 安装 gridstack**

Run: `npm install gridstack`

- [ ] **Step 2: 创建 DashboardGridStack 组件**

```typescript
// src/components/DashboardGridStack.tsx
import { useRef, useEffect, useCallback } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import type { GridPosition, CardConfig } from '@/types/dashboard';

export interface DashboardGridItem {
  config: CardConfig;
  grid: GridPosition;
}

interface DashboardGridStackProps {
  items: DashboardGridItem[];
  isEditing: boolean;
  onLayoutChange: (positions: Array<{ id: string; grid: GridPosition }>) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (cardId: string) => void;
  renderCard: (config: CardConfig) => React.ReactNode;
}

export default function DashboardGridStack({
  items,
  isEditing,
  onLayoutChange,
  onDeleteCard,
  onEditCard,
  renderCard,
}: DashboardGridStackProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gsRef = useRef<GridStack | null>(null);

  // 初始化 gridstack
  useEffect(() => {
    if (!gridRef.current || gsRef.current) return;
    const grid = GridStack.init(
      {
        column: 12,
        cellHeight: 80,
        margin: 12,
        float: false,
        animate: true,
        disableOneColumnMode: true,
        removable: false,
      },
      gridRef.current
    );
    gsRef.current = grid;

    grid.on('change', () => {
      const nodes = grid.getGridItems().map((el) => {
        const node = el.gridstackNode;
        return {
          id: node?.id || '',
          grid: {
            x: node?.x ?? 0,
            y: node?.y ?? 0,
            w: node?.w ?? 6,
            h: node?.h ?? 4,
          },
        };
      });
      onLayoutChange(nodes);
    });

    return () => {
      grid.destroy(false);
      gsRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 编辑模式切换
  useEffect(() => {
    const grid = gsRef.current;
    if (!grid) return;
    if (isEditing) {
      grid.enableMove(true);
      grid.enableResize(true);
    } else {
      grid.enableMove(false);
      grid.enableResize(false);
    }
  }, [isEditing]);

  // 同步 items 到 gridstack
  const syncItems = useCallback(() => {
    const grid = gsRef.current;
    if (!grid) return;
    grid.batchUpdate();
    grid.removeAll(false);
    items.forEach((item) => {
      const el = document.getElementById(`gs-card-${item.config.id}`);
      if (el) {
        grid.addWidget(el, {
          id: item.config.id,
          x: item.grid.x,
          y: item.grid.y,
          w: item.grid.w,
          h: item.grid.h,
          minW: 4,
          minH: 4,
        });
      }
    });
    grid.batchUpdate(false);
  }, [items]);

  useEffect(() => {
    // 延迟一帧让 React 渲染 DOM 后再同步
    requestAnimationFrame(syncItems);
  }, [syncItems]);

  return (
    <div ref={gridRef} className="grid-stack">
      {items.map((item) => (
        <div
          key={item.config.id}
          id={`gs-card-${item.config.id}`}
          className="grid-stack-item"
          gs-id={item.config.id}
          gs-x={item.grid.x}
          gs-y={item.grid.y}
          gs-w={item.grid.w}
          gs-h={item.grid.h}
          gs-min-w={4}
          gs-min-h={4}
        >
          <div className={`grid-stack-item-content rounded-lg overflow-hidden ${isEditing ? 'ring-2 ring-dashed ring-primary/30' : ''}`}>
            {isEditing && (
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <button
                  onClick={() => onEditCard(item.config.id)}
                  className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center hover:bg-primary/80 shadow"
                >
                  ✎
                </button>
                <button
                  onClick={() => onDeleteCard(item.config.id)}
                  className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 shadow"
                >
                  ✕
                </button>
              </div>
            )}
            {renderCard(item.config)}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: 提交**

```bash
git add package.json package-lock.json src/components/DashboardGridStack.tsx
git commit -m "feat: 基于 gridstack.js 实现看板网格组件"
```

---

## Task 7: 看板状态管理 hook（TDD）

**Files:**
- Create: `src/hooks/useDashboardStore.ts`
- Create: `src/hooks/__tests__/useDashboardStore.test.ts`

- [ ] **Step 1: 写测试文件**

```typescript
// src/hooks/__tests__/useDashboardStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { loadDashboard, saveDashboard, DEFAULT_CARDS } from '../useDashboardStore';
import type { DashboardLayout } from '@/types/dashboard';

beforeEach(() => {
  localStorage.clear();
});

describe('loadDashboard', () => {
  it('returns default cards when localStorage is empty', () => {
    const cards = loadDashboard();
    expect(cards).toEqual(DEFAULT_CARDS);
  });

  it('loads saved cards from localStorage', () => {
    const saved: DashboardLayout = { version: 2, cards: [DEFAULT_CARDS[0]] };
    localStorage.setItem('dashboard-v2', JSON.stringify(saved));
    const cards = loadDashboard();
    expect(cards).toHaveLength(1);
    expect(cards[0].config.id).toBe(DEFAULT_CARDS[0].config.id);
  });

  it('falls back to default on corrupted data', () => {
    localStorage.setItem('dashboard-v2', 'NOT VALID JSON{{{');
    const cards = loadDashboard();
    expect(cards).toEqual(DEFAULT_CARDS);
  });

  it('falls back to default on wrong version', () => {
    localStorage.setItem('dashboard-v2', JSON.stringify({ version: 99, cards: [] }));
    const cards = loadDashboard();
    expect(cards).toEqual(DEFAULT_CARDS);
  });
});

describe('saveDashboard', () => {
  it('saves cards to localStorage', () => {
    saveDashboard([DEFAULT_CARDS[0]]);
    const raw = localStorage.getItem('dashboard-v2');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as DashboardLayout;
    expect(parsed.version).toBe(2);
    expect(parsed.cards).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/hooks/__tests__/useDashboardStore.test.ts`
Expected: FAIL — cannot find '../useDashboardStore'

- [ ] **Step 3: 实现 useDashboardStore**

```typescript
// src/hooks/useDashboardStore.ts
import { useState, useCallback } from 'react';
import type { CardConfig, DashboardCard, DashboardLayout, GridPosition, ChartType } from '@/types/dashboard';

const STORAGE_KEY = 'dashboard-v2';

export const DEFAULT_CARDS: DashboardCard[] = [
  {
    config: {
      id: 'default-1',
      title: '产线产量完成情况',
      dataSourceId: 'line-production',
      chartType: 'bar',
      groupByField: 'lineName',
      valueFields: ['planned', 'actual'],
      aggregation: 'none',
    },
    grid: { x: 0, y: 0, w: 6, h: 4 },
  },
  {
    config: {
      id: 'default-2',
      title: '近7天不良率趋势',
      dataSourceId: 'weekly-defects',
      chartType: 'line',
      groupByField: 'date',
      valueFields: ['defectRate'],
      aggregation: 'none',
    },
    grid: { x: 6, y: 0, w: 6, h: 4 },
  },
  {
    config: {
      id: 'default-3',
      title: '不良类型分布',
      dataSourceId: 'quality',
      chartType: 'pie',
      groupByField: 'defectType',
      valueFields: ['defectCount'],
      aggregation: 'sum',
    },
    grid: { x: 0, y: 4, w: 6, h: 4 },
  },
];

export function loadDashboard(): DashboardCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CARDS;
    const parsed = JSON.parse(raw) as DashboardLayout;
    if (parsed.version !== 2 || !Array.isArray(parsed.cards)) return DEFAULT_CARDS;
    return parsed.cards;
  } catch {
    return DEFAULT_CARDS;
  }
}

export function saveDashboard(cards: DashboardCard[]): void {
  const layout: DashboardLayout = { version: 2, cards };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
}

export function useDashboardStore() {
  const [cards, setCards] = useState<DashboardCard[]>(() => loadDashboard());
  const [snapshot, setSnapshot] = useState<DashboardCard[]>(() => loadDashboard());
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = useCallback(() => {
    setSnapshot([...cards]);
    setIsEditing(true);
  }, [cards]);

  const save = useCallback(() => {
    saveDashboard(cards);
    setSnapshot(cards);
    setIsEditing(false);
  }, [cards]);

  const cancel = useCallback(() => {
    setCards(snapshot);
    setIsEditing(false);
  }, [snapshot]);

  const addCard = useCallback((config: CardConfig) => {
    setCards((prev) => {
      const maxY = prev.reduce((max, c) => Math.max(max, c.grid.y + c.grid.h), 0);
      return [...prev, { config, grid: { x: 0, y: maxY, w: 6, h: 4 } }];
    });
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<CardConfig>) => {
    setCards((prev) =>
      prev.map((c) =>
        c.config.id === cardId ? { ...c, config: { ...c.config, ...updates } } : c
      )
    );
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.config.id !== cardId));
  }, []);

  const updateLayout = useCallback((positions: Array<{ id: string; grid: GridPosition }>) => {
    setCards((prev) =>
      prev.map((c) => {
        const pos = positions.find((p) => p.id === c.config.id);
        return pos ? { ...c, grid: pos.grid } : c;
      })
    );
  }, []);

  const resetToDefault = useCallback(() => {
    setCards(DEFAULT_CARDS);
    saveDashboard(DEFAULT_CARDS);
  }, []);

  return {
    cards,
    isEditing,
    startEditing,
    save,
    cancel,
    addCard,
    updateCard,
    deleteCard,
    updateLayout,
    resetToDefault,
  };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/hooks/__tests__/useDashboardStore.test.ts`
Expected: 5 tests PASS

- [ ] **Step 5: 提交**

```bash
git add src/hooks/useDashboardStore.ts src/hooks/__tests__/useDashboardStore.test.ts
git commit -m "feat: 看板状态管理 hook + localStorage 持久化"
```

---

## Task 8: 看板卡片渲染器

**Files:**
- Create: `src/components/DashboardCardRenderer.tsx`

- [ ] **Step 1: 创建卡片渲染器**

该组件根据 `CardConfig` 独立获取数据 → 聚合 → 渲染 Recharts 图表。

```typescript
// src/components/DashboardCardRenderer.tsx
import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getDataSourceData } from '@/api';
import { aggregate } from '@/lib/aggregationEngine';
import { useRequest } from '@/hooks/useRequest';
import type { CardConfig, ChartType } from '@/types/dashboard';

const COLORS = ['#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D', '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00'];

const CHART_LABELS: Record<ChartType, string> = {
  bar: '柱状图',
  line: '折线图',
  pie: '饼图',
  number: '数值',
  table: '表格',
};

const RADIAN = Math.PI / 180;
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

interface DashboardCardRendererProps {
  config: CardConfig;
  onChartTypeChange?: (type: ChartType) => void;
}

export default function DashboardCardRenderer({ config, onChartTypeChange }: DashboardCardRendererProps) {
  const fetcher = useCallback(() => getDataSourceData(config.dataSourceId), [config.dataSourceId]);
  const { data: rawData } = useRequest(fetcher, [config.dataSourceId]);

  const chartData = rawData
    ? aggregate({
        data: rawData,
        groupByField: config.groupByField,
        valueFields: config.valueFields,
        aggregation: config.aggregation,
      })
    : [];

  const tickStyle = { fontSize: 12, fill: '#86909C' };
  const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #E5E6EB', borderRadius: 4 };

  // 根据配置推断支持的图表类型
  const supportedTypes: ChartType[] = ['bar', 'line', 'pie'];

  const renderChart = () => {
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">加载中...</div>;
    }

    switch (config.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.groupByField} tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {config.valueFields.map((field, i) => (
                <Bar key={field} dataKey={field} fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.groupByField} tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {config.valueFields.map((field, i) => (
                <Line key={field} type="monotone" dataKey={field} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={config.valueFields[0]}
                nameKey={config.groupByField}
                cx="50%" cy="50%" outerRadius={100}
                label={renderPieLabel} labelLine={false}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-0 pt-3 px-4 flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
        {onChartTypeChange && (
          <div className="flex gap-1">
            {supportedTypes.map((type) => (
              <Button
                key={type}
                size="xs"
                variant={config.chartType === type ? 'default' : 'outline'}
                onClick={() => onChartTypeChange(type)}
              >
                {CHART_LABELS[type]}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-2">{renderChart()}</CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 提交**

```bash
git add src/components/DashboardCardRenderer.tsx
git commit -m "feat: 看板卡片渲染器 (API→聚合→Recharts)"
```

---

## Task 9: 指标搭建器 ChartBuilder

**Files:**
- Create: `src/components/ChartBuilder.tsx`

需要先安装 shadcn dialog 组件：

- [ ] **Step 1: 安装 shadcn dialog**

Run: `npx shadcn@latest add dialog checkbox label -y`

- [ ] **Step 2: 创建 ChartBuilder 组件**

这是最复杂的组件，包含 3 步向导。由于代码较长，分几个关键部分说明：

**组件结构：**
- 使用 shadcn Dialog 作为弹窗容器
- 内部维护 step 状态 (1/2/3)
- Step 1: 选数据源（4 个卡片选择）
- Step 2: 配置字段（checkbox 选字段 + select 选分组/聚合）
- Step 3: 选图表类型 + 实时预览 + 标题输入

**Props：**
```typescript
interface ChartBuilderProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: CardConfig) => void;
  editingCard?: CardConfig;  // 编辑已有卡片时传入
}
```

**内部 state：**
```typescript
const [step, setStep] = useState(1);
const [dataSourceId, setDataSourceId] = useState('');
const [selectedFields, setSelectedFields] = useState<string[]>([]);
const [groupByField, setGroupByField] = useState('');
const [aggregation, setAggregation] = useState<Aggregation>('none');
const [chartType, setChartType] = useState<ChartType>('bar');
const [title, setTitle] = useState('');
```

**数据获取逻辑：**
- Step 2 选完数据源后，调用 `getDataSourceData(dataSourceId)` 获取示例数据
- Step 3 用已选字段 + 聚合配置，调用 `aggregate()` 处理后传给 Recharts 预览

**确认逻辑：**
```typescript
const handleConfirm = () => {
  const config: CardConfig = {
    id: editingCard?.id || Date.now().toString(),
    title: title || `${groupByField} 的 ${selectedValueFields.join('/')}`,
    dataSourceId,
    chartType,
    groupByField,
    valueFields: selectedValueFields,
    aggregation,
  };
  onConfirm(config);
  onClose();
};
```

完整代码见实现阶段，此处不展开每行代码以控制计划长度。核心是 3 步 UI 渲染逻辑 + 数据预览。

- [ ] **Step 3: 验证 TypeScript 编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: 提交**

```bash
git add src/components/ChartBuilder.tsx src/components/ui/dialog.tsx src/components/ui/checkbox.tsx src/components/ui/label.tsx
git commit -m "feat: 指标搭建器 ChartBuilder (3 步向导)"
```

---

## Task 10: 改造 DashboardToolbar

**Files:**
- Modify: `src/components/DashboardToolbar.tsx`

- [ ] **Step 1: 更新 DashboardToolbar**

修改现有 `DashboardToolbar.tsx`，保持 Props 不变（已有 `onAddCard` prop），只需调整按钮文案：

将编辑模式下的「添加卡片」按钮文案改为「新建图表」：

```typescript
<Button variant="outline" onClick={onAddCard}>
  新建图表
</Button>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/DashboardToolbar.tsx
git commit -m "refactor: DashboardToolbar 按钮文案调整"
```

---

## Task 11: 集成 Overview 页面

**Files:**
- Modify: `src/pages/Overview.tsx`

- [ ] **Step 1: 重写 Overview.tsx**

保留 KPI 卡片行和状态汇总栏，将图表区域替换为 DashboardGridStack + ChartBuilder。

**关键结构：**
```
<DashboardToolbar />
<KPI Cards />         ← 保留不变
<Status Bar />        ← 保留不变
<DashboardGridStack>  ← 新的拖拽看板
  <DashboardCardRenderer /> × N
</DashboardGridStack>
<ChartBuilder />      ← 搭建器弹窗
```

**集成要点：**
- 用 `useDashboardStore()` 管理所有状态
- 用 `useState` 控制 ChartBuilder 弹窗开关 + editingCardId
- `DashboardGridStack.renderCard` 渲染 `DashboardCardRenderer`
- `onEditCard` 打开 ChartBuilder 并传入 editingCard
- `onConfirm` 区分新增（addCard）和更新（updateCard）

- [ ] **Step 2: 验证 TypeScript 编译和构建**

Run: `npx tsc --noEmit && npx vite build`
Expected: 编译和构建均成功

- [ ] **Step 3: 提交**

```bash
git add src/pages/Overview.tsx
git commit -m "feat: Overview 页面集成看板 + 搭建器"
```

---

## Task 12: 清理旧文件

**Files:**
- Delete: `src/components/DashboardEngine.tsx`
- Delete: `src/components/IndicatorLibrary.tsx`
- Delete: `src/components/indicators.ts`
- Delete: `src/hooks/useDashboardLayout.ts`

- [ ] **Step 1: 删除旧文件**

```bash
rm src/components/DashboardEngine.tsx
rm src/components/IndicatorLibrary.tsx
rm src/components/indicators.ts
rm src/hooks/useDashboardLayout.ts
```

- [ ] **Step 2: 验证构建不报错**

Run: `npx tsc --noEmit && npx vite build`
Expected: 无错误（如果有引用错误，修复残留的 import）

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "refactor: 删除旧的 DashboardEngine/IndicatorLibrary/indicators"
```

---

## Task 13: 端到端验证

- [ ] **Step 1: 启动前后端**

Run: `npm run dev`
Expected: server 在 3001，client 在 5173

- [ ] **Step 2: 验证默认看板渲染**

打开 http://localhost:5173/overview
Expected: 看到 KPI 卡片 + 状态栏 + 3 个默认图表（柱状图、折线图、饼图）

- [ ] **Step 3: 验证搭建流程**

1. 点击「编辑看板」进入编辑模式
2. 点击「新建图表」打开搭建器
3. 选择「设备数据」
4. 勾选「设备名称」和「OEE」，分组维度选「所属产线」，聚合选「平均」
5. 选择「柱状图」，预览应显示按产线分组的 OEE 平均值柱状图
6. 输入标题「产线 OEE 平均值」，点击「添加到看板」
7. 新卡片应出现在看板中
8. 拖拽新卡片到右上位置
9. 点击「保存」

- [ ] **Step 4: 验证持久化**

1. 刷新页面
2. 看板应恢复到保存时的状态（4 个卡片 + 自定义位置）
3. 进入编辑模式 → 点击「恢复默认」
4. 看板应回到 3 个默认卡片

- [ ] **Step 5: 运行全部测试**

Run: `npx vitest run`
Expected: 全部通过

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "test: 端到端验证通过"
```

---

## 任务依赖关系

```
Task 1 (类型) ─┬─→ Task 2 (聚合引擎)
               ├─→ Task 3 (数据源注册表)
               ├─→ Task 4 (后端 API) → Task 5 (前端 API)
               ├─→ Task 7 (状态管理 hook)
               └─→ Task 6 (GridStack 组件)

Task 2 + Task 5 + Task 8 (卡片渲染器) ─→ Task 9 (ChartBuilder)

Task 6 + Task 7 + Task 8 + Task 9 + Task 10 (Toolbar) ─→ Task 11 (集成 Overview)

Task 11 ─→ Task 12 (清理) ─→ Task 13 (端到端验证)
```

**可并行的任务：** Task 2、3、4、6、7 在 Task 1 完成后可同时进行。
