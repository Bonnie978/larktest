# Task 1：基础设施 + 看板渲染

| 字段 | 内容 |
|------|------|
| 来源文档 | `docs/task-breakdown.md` |
| 关联需求 | 生产概览页 - 自助式可视化仪表盘 |
| 关联技术文档 | `docs/technical-design.md` |
| 负责角色 | 全栈开发 |
| 预计工时 | 2.5 天 |
| 前置依赖 | 无 |
| 后续阻塞 | Task 2、Task 3 |

---

> **用户场景**：用户首次打开生产概览页，看到 KPI 卡片、状态汇总、以及 3 个默认图表（柱状图、折线图、饼图），图表数据从 API 获取并正确渲染。

## 交付物

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 新增 recharts、react-grid-layout、@types/react-grid-layout |
| `src/types/dashboard.ts` | 新增 | 全部 TypeScript 类型定义 |
| `src/constants/dashboard.ts` | 新增 | 网格配置、色板、聚合选项、数据源图标、默认看板 |
| `src/index.css` | 修改 | 图表色变量 5→8 色、react-grid-layout 样式、搭建器弹窗样式 |
| `server/src/routes/datasource.ts` | 新增 | 数据源路由（元数据 + 数据查询） |
| `server/src/index.ts` | 修改 | 注册 datasource 路由 |
| `src/api/index.ts` | 修改 | 新增 getDatasources、getDatasourceData |
| `src/utils/aggregation.ts` | 新增 | 前端聚合计算纯函数 |
| `src/utils/__tests__/aggregation.test.ts` | 新增 | 聚合函数单元测试 |
| `src/components/charts/BarChart.tsx` | 新增 | 柱状图封装 |
| `src/components/charts/LineChart.tsx` | 新增 | 折线图封装 |
| `src/components/charts/PieChart.tsx` | 新增 | 饼图（环形图）封装 |
| `src/components/charts/index.ts` | 新增 | 统一导出 |
| `src/components/dashboard/ChartCard.tsx` | 新增 | 图表卡片组件 |

## 实现要求

### 1. 依赖安装

```bash
npm install recharts react-grid-layout
npm install -D @types/react-grid-layout
```

### 2. 类型定义（`src/types/dashboard.ts`）

完整定义以下类型（字段和类型严格遵循技术文档四.1 节）：

- `ChartType`：`'bar' | 'line' | 'pie'`
- `AggregationType`：`'sum' | 'avg' | 'count' | 'max' | 'none'`
- `BuilderMode`：`'create' | 'edit'`
- `DataSourceField`：`{ key, label, type: 'string' | 'number' }`
- `DataSourceMeta`：`{ id, name, fields: DataSourceField[] }`
- `CardConfig`：`{ id, title, dataSourceId, chartType, groupByField, valueFields, aggregation }`
- `GridPosition`：`{ x, y, w, h }`
- `DashboardCard`：`{ config: CardConfig, grid: GridPosition }`
- `DashboardLayout`：`{ version: 2, cards: DashboardCard[] }`
- `BuilderState`：`{ open, mode, editingCardId }`

### 3. 常量定义（`src/constants/dashboard.ts`）

| 常量 | 值 |
|------|-----|
| `STORAGE_KEY` | `'dashboard-v2'` |
| `LAYOUT_VERSION` | `2` |
| `GRID_CONFIG` | `{ cols: 12, rowHeight: 100, margin: [12,12], containerPadding: [0,0], minW: 4, minH: 4 }` |
| `CHART_COLORS` | 需求文档 8 色：`#1664FF, #14C9C9, #78D3F8, #9FDB1D, #F7BA1E, #722ED1, #F53F3F, #FF7D00` |
| `AGGREGATION_OPTIONS` | 5 项：无聚合/求和/平均值/计数/最大值 |
| `CHART_TYPE_OPTIONS` | 3 项：柱状图(bar, BarChart3) / 折线图(line, TrendingUp) / 饼图(pie, PieChart) |
| `DATASOURCE_ICONS` | 5 项 emoji：`line-production→🏭, equipment→⚙️, quality→🔍, orders→📋, weekly-defects→📈` |
| `DEFAULT_DASHBOARD` | 3 个预设卡片，位置和配置严格遵循需求文档五.5 节 |

`DEFAULT_DASHBOARD` 的 3 个卡片：

| 位置 | 标题 | 图表类型 | 数据源 | 维度 | 指标 | 聚合 |
|------|------|---------|--------|------|------|------|
| x:0 y:0 w:6 h:4 | 产线产量完成情况 | bar | line-production | lineName | planned, actual | none |
| x:6 y:0 w:6 h:4 | 近7天不良率趋势 | line | weekly-defects | date | defectRate | none |
| x:0 y:4 w:6 h:4 | 不良类型分布 | pie | quality | defectType | defectCount | sum |

### 4. CSS 扩展（`src/index.css`）

将 `:root` 中的 `--chart-1` ~ `--chart-5` 替换为 8 色色板，并新增：

```css
/* react-grid-layout 编辑模式 */
.dashboard-editing .react-grid-item {
  border: 1px dashed rgba(22, 100, 255, 0.3);
  border-radius: var(--radius-lg);
  transition: box-shadow 0.2s;
}
.dashboard-editing .react-grid-item:hover {
  box-shadow: 0 2px 8px rgba(22, 100, 255, 0.15);
}
.react-grid-item.react-grid-placeholder {
  background: rgba(22, 100, 255, 0.08) !important;
  border: 2px dashed rgba(22, 100, 255, 0.4) !important;
  border-radius: var(--radius-lg);
}
.chart-builder-dialog {
  width: 900px;
  max-height: 640px;
}
```

### 5. 后端 API（`server/src/routes/datasource.ts`）

**GET /api/datasource** — 返回 5 个数据源元数据。

字段注册表严格遵循需求文档第四节：

| 数据源 ID | 名称 | string 字段 | number 字段 |
|-----------|------|------------|------------|
| `line-production` | 产线数据 | lineName, shift | planned, actual, completionRate |
| `equipment` | 设备数据 | name, lineName, type, status | availability, performance, quality, oee |
| `quality` | 质量数据 | lineName, defectType, inspector, status | defectCount |
| `orders` | 工单数据 | productModel, customer, deliveryStatus | plannedQty, completedQty |
| `weekly-defects` | 不良趋势-周 | date, mainDefectType | inspectedQty, defectQty, defectRate |

响应格式：`{ code: 0, data: DataSourceMeta[], message: 'success' }`

**GET /api/datasource/:id/data** — 查询数据。

- `:id` 不存在 → 404 `{ code: 1, data: null, message: '数据源 xxx 不存在' }`
- Query `fields`（可选）：逗号分隔，字段投影
- 其他 Query 参数：等值筛选
- 数据源映射：`line-production → lineProductionData`、`equipment → equipmentList`、`quality → qualityRecords`、`orders → workOrders`、`weekly-defects → weeklyDefectData`

在 `server/src/index.ts` 注册路由：
```typescript
import datasourceRouter from './routes/datasource.js';
app.use('/api/datasource', datasourceRouter);
```

### 6. 前端 API 函数（`src/api/index.ts` 新增）

```typescript
export const getDatasources = () => request<DataSourceMeta[]>('/datasource');
export const getDatasourceData = (id: string, params?: Record<string, string>) =>
  request<Record<string, any>[]>(`/datasource/${id}/data`, params);
```

### 7. 聚合函数（`src/utils/aggregation.ts`）

函数签名：
```typescript
export function aggregate(
  data: Record<string, any>[],
  groupByField: string,
  valueFields: string[],
  aggregation: AggregationType
): Record<string, any>[];
```

聚合逻辑（需求文档第八节）：

| 方式 | 逻辑 |
|------|------|
| `none` | 直接透传，仅保留 groupByField + valueFields |
| `sum` | 按 groupByField 分组，每组每个 valueField 求和 |
| `avg` | 分组求算术平均，保留 1 位小数 |
| `count` | 分组计数 |
| `max` | 分组取最大值 |

边界：空数组→空数组，非数字值→当作 0，null 分组键→空字符串。

单元测试（`src/utils/__tests__/aggregation.test.ts`）≥10 个用例，覆盖 5 种聚合 + 3 种边界。

### 8. 图表组件（`src/components/charts/`）

**统一 Props**：
```typescript
export interface ChartProps {
  data: Record<string, any>[];
  groupByField: string;
  valueFields: string[];
  fieldLabels: Record<string, string>;
  height?: number; // 默认 280
}
```

**BarChart**（需求文档九.2 节样式）：
- 坐标轴：fontSize 11, fill #86909C
- 网格线：strokeDasharray "3 3", stroke #F2F3F5
- Tooltip：白色背景, border 1px solid #E5E6EB, borderRadius 6
- 柱子：radius [3,3,0,0]，颜色按 CHART_COLORS 顺序
- 多 valueField → 多个 `<Bar>`

**LineChart**：
- strokeWidth 2, dot r=4, activeDot r=6, type="monotone"
- 其余同 BarChart

**PieChart**（环形图）：
- innerRadius 50, outerRadius 110
- label 显示 `名称 百分比%`
- 仅使用 valueFields[0]
- Cell 颜色按 CHART_COLORS 顺序

### 9. ChartCard 组件（`src/components/dashboard/ChartCard.tsx`）

**Props**（技术文档四.9 节）：
```typescript
interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChartTypeChange: (type: ChartType) => void;
}
```

**内部结构**：
```
┌────────────────────────────────────────┐
│ drag-handle                            │
│ 标题            [📊][📈][🍩]   [✎][✕] │
├────────────────────────────────────────┤
│         Recharts 图表 (h=280px)        │
└────────────────────────────────────────┘
```

**数据流**：
1. `useRequest(getDatasourceData(config.dataSourceId))` 获取原始数据
2. `useRequest(getDatasources)` 获取字段元数据（构建 fieldLabels）
3. `useMemo` + `aggregate()` 聚合
4. 按 `config.chartType` 渲染 BarChart / LineChart / PieChart

**图表类型切换按钮组**：3 个图标按钮（BarChart3/TrendingUp/PieChart），当前类型主色高亮，其余灰色，查看/编辑模式均显示。

**编辑/删除按钮**：仅 `isEditing=true` 时显示。✎ 蓝色圆形，✕ 红色圆形。

**拖拽手柄**：头部区域 `className="drag-handle"`，编辑模式 cursor=move。

**加载状态**：loading 时显示居中提示文字。

## 验收标准

- [ ] `npm install` 无报错，`npx tsc --noEmit` 类型检查通过
- [ ] `GET /api/datasource` 返回 5 个数据源，fields 与需求文档第四节匹配
- [ ] `GET /api/datasource/equipment/data?fields=name,oee&status=运行中` 正确返回投影 + 筛选结果
- [ ] `GET /api/datasource/not-exist/data` 返回 404
- [ ] 聚合函数测试全部通过（`npx vitest run src/utils/__tests__/aggregation.test.ts`）
- [ ] ChartCard 传入 `DEFAULT_DASHBOARD[0]` 配置 → 渲染出产线产量柱状图，数据正确
- [ ] ChartCard 传入 `DEFAULT_DASHBOARD[1]` 配置 → 渲染出不良率折线图
- [ ] ChartCard 传入 `DEFAULT_DASHBOARD[2]` 配置 → 渲染出不良类型饼图，数据经过 sum 聚合
- [ ] 图表样式（色板、圆角、Tooltip、坐标轴）符合需求文档九.2 节
- [ ] 图表类型切换按钮点击后图表正确切换
- [ ] `isEditing=false` 时无 ✎✕ 按钮，`isEditing=true` 时显示
- [ ] 现有 5 个后端路由功能不受影响
