# 智造云 · 自助式可视化仪表盘 — 任务拆分文档

| 字段 | 内容 |
|------|------|
| 关联需求 | 生产概览页 - 自助式可视化仪表盘 |
| 关联技术文档 | `docs/technical-design.md` |
| 拆分策略 | 按用户场景拆分，3 个任务 |
| 并行度 | Task 2 与 Task 3 可并行（最多 3 人） |

---

## 任务总览与依赖关系

```
         ┌───────────────────────┐
         │       Task 1          │
         │  基础设施 + 看板渲染    │
         │  "打开页面看到默认图表" │
         └───────────┬───────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
 ┌─────────────────┐  ┌─────────────────┐
 │     Task 2      │  │     Task 3      │
 │   看板编辑       │  │   图表搭建器     │
 │  "拖拽/保存/恢复"│  │  "自助创建图表"  │
 └─────────────────┘  └─────────────────┘
      可 并 行 开 发
```

**最短交付路径**：Task 1（2.5 天）→ Task 2 + Task 3 并行（2 天）= **约 4.5 个工作日**

---

## Task 1：基础设施 + 看板渲染

> **用户场景**：用户首次打开生产概览页，看到 KPI 卡片、状态汇总、以及 3 个默认图表（柱状图、折线图、饼图），图表数据从 API 获取并正确渲染。

| 字段 | 内容 |
|------|------|
| 负责角色 | 全栈开发 |
| 预计工时 | 2.5 天 |
| 前置依赖 | 无 |
| 后续阻塞 | Task 2、Task 3 |

### 交付物

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

### 实现要求

#### 1. 依赖安装

```bash
npm install recharts react-grid-layout
npm install -D @types/react-grid-layout
```

#### 2. 类型定义（`src/types/dashboard.ts`）

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

#### 3. 常量定义（`src/constants/dashboard.ts`）

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

#### 4. CSS 扩展（`src/index.css`）

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

#### 5. 后端 API（`server/src/routes/datasource.ts`）

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

#### 6. 前端 API 函数（`src/api/index.ts` 新增）

```typescript
export const getDatasources = () => request<DataSourceMeta[]>('/datasource');
export const getDatasourceData = (id: string, params?: Record<string, string>) =>
  request<Record<string, any>[]>(`/datasource/${id}/data`, params);
```

#### 7. 聚合函数（`src/utils/aggregation.ts`）

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

#### 8. 图表组件（`src/components/charts/`）

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

#### 9. ChartCard 组件（`src/components/dashboard/ChartCard.tsx`）

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

### 验收标准

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

---

## Task 2：看板编辑

> **用户场景**：用户点击「编辑仪表盘」进入编辑模式，可拖拽移动/缩放图表卡片，可删除卡片，点击「保存」持久化布局，点击「取消」恢复，点击「恢复默认」回到预设看板。刷新页面后布局保持。

| 字段 | 内容 |
|------|------|
| 负责角色 | 前端开发 |
| 预计工时 | 2 天 |
| 前置依赖 | Task 1（类型/常量/ChartCard） |
| 可并行 | 与 Task 3 并行开发 |

### 交付物

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/hooks/useDashboard.ts` | 新增 | 仪表盘核心状态管理 Hook |
| `src/components/dashboard/DashboardGrid.tsx` | 新增 | react-grid-layout 拖拽网格容器 |
| `src/components/dashboard/DashboardToolbar.tsx` | 新增 | 编辑/查看模式工具栏 |
| `src/components/dashboard/index.ts` | 新增 | 统一导出 |
| `src/pages/Overview.tsx` | 修改 | 集成 DashboardGrid + DashboardToolbar + 移除固定表格 |
| `src/hooks/__tests__/useDashboard.test.ts` | 新增 | Hook 单元测试 |
| `src/components/dashboard/__tests__/DashboardToolbar.test.tsx` | 新增 | Toolbar 测试 |

### 实现要求

#### 1. useDashboard Hook（`src/hooks/useDashboard.ts`）

**返回值签名**（技术文档四.6 节）：
```typescript
function useDashboard(): {
  // 状态
  cards: DashboardCard[];
  isEditing: boolean;
  builder: BuilderState;

  // 模式切换
  enterEditMode: () => void;
  cancelEdit: () => void;
  saveLayout: () => void;
  resetToDefault: () => void;

  // 卡片操作
  addCard: (config: CardConfig) => void;
  updateCard: (config: CardConfig) => void;
  deleteCard: (cardId: string) => void;
  updateCardChartType: (cardId: string, chartType: ChartType) => void;

  // 网格布局
  onLayoutChange: (layout: ReactGridLayout.Layout[]) => void;

  // 搭建器
  openBuilder: (mode: BuilderMode, cardId?: string) => void;
  closeBuilder: () => void;
}
```

**持久化读取（初始化）**：
```
localStorage.getItem('dashboard-v2')
  → null / JSON 解析失败 / version ≠ 2 / cards 非数组 → DEFAULT_DASHBOARD
  → 正常 → 使用存储的 cards
```

**持久化写入（保存时）**：
```typescript
localStorage.setItem('dashboard-v2', JSON.stringify({ version: 2, cards }));
```

**编辑模式快照机制**：

| 方法 | 行为 |
|------|------|
| `enterEditMode()` | 深拷贝当前 cards → 快照，isEditing = true |
| `cancelEdit()` | cards = 快照，清空快照，isEditing = false，closeBuilder |
| `saveLayout()` | 写入 localStorage，清空快照，isEditing = false，closeBuilder |
| `resetToDefault()` | cards = DEFAULT_DASHBOARD，保持编辑模式 |

**卡片操作**：

| 方法 | 行为 |
|------|------|
| `addCard(config)` | 已有卡片 y += 4，新卡片 {x:0, y:0, w:6, h:4} 插入头部 |
| `updateCard(config)` | 按 id 替换 config，保留 grid 不变 |
| `deleteCard(cardId)` | 按 id 移除 |
| `updateCardChartType(cardId, type)` | 仅更新 config.chartType |

**onLayoutChange**：将 react-grid-layout 的 Layout[] 同步到 cards 的 grid 字段。

**搭建器控制**：

| 方法 | 行为 |
|------|------|
| `openBuilder('create')` | `{ open: true, mode: 'create', editingCardId: null }` |
| `openBuilder('edit', cardId)` | `{ open: true, mode: 'edit', editingCardId: cardId }` |
| `closeBuilder()` | `{ open: false, mode: 'create', editingCardId: null }` |

#### 2. DashboardGrid（`src/components/dashboard/DashboardGrid.tsx`）

**Props**（技术文档四.8 节）：
```typescript
interface DashboardGridProps {
  cards: DashboardCard[];
  isEditing: boolean;
  onLayoutChange: (layout: ReactGridLayout.Layout[]) => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onChartTypeChange: (cardId: string, type: ChartType) => void;
}
```

**实现要点**：
- 使用 `WidthProvider(Responsive)` 包裹
- 引入 `react-grid-layout/css/styles.css` 和 `react-resizable/css/styles.css`
- 网格配置：cols=12, rowHeight=100, margin=[12,12]（来自 GRID_CONFIG）
- `isDraggable` / `isResizable` 由 `isEditing` 控制
- `draggableHandle=".drag-handle"`
- 编辑模式外层添加 `className="dashboard-editing"`
- layout 数组映射：`{ i: card.config.id, x, y, w, h, minW: 4, minH: 4 }`
- 每个 grid item 内部渲染 `<ChartCard>`（来自 Task 1）

#### 3. DashboardToolbar（`src/components/dashboard/DashboardToolbar.tsx`）

**Props**（技术文档四.7 节）：
```typescript
interface DashboardToolbarProps {
  isEditing: boolean;
  onEnterEdit: () => void;
  onNewChart: () => void;
  onReset: () => void;
  onCancel: () => void;
  onSave: () => void;
}
```

**按钮显示规则**：

| 模式 | 按钮 | variant | 图标 |
|------|------|---------|------|
| 查看 | 编辑仪表盘 | outline | Settings |
| 编辑 | 新建图表 | default | Plus |
| 编辑 | 恢复默认 | outline | RotateCcw |
| 编辑 | 取消 | ghost | — |
| 编辑 | 保存 | default | — |

使用现有 shadcn `Button` 组件 + Lucide 图标。

#### 4. Overview 页面改造（`src/pages/Overview.tsx`）

**保持不变**：
- 标题栏 "生产概览" + 日期
- KPI 卡片 ×5
- 状态汇总 ×4
- 上述区域的 API 调用（getKPI, getLines, getEquipment, getOrders, getQualityRecords）

**删除**：
- 底部「产线产量完成情况」固定表格（Card + Table）
- 底部「近 7 天不良数据汇总」固定表格（Card + Table）
- `productionColumns`、`defectColumns` 定义
- `getLineProduction`、`getWeeklyDefects` 的 import 和 useRequest 调用
- `LineProductionRow`、`WeeklyDefectRow` 的 import

**新增**：
```typescript
import { useDashboard } from '@/hooks/useDashboard';
import { getDatasources } from '@/api';
import { DashboardToolbar, DashboardGrid } from '@/components/dashboard';
```

- 标题栏右侧：日期 + `<DashboardToolbar>` 并排
- 状态汇总下方：`<DashboardGrid>`
- 暂时不集成 ChartBuilder（Task 3 的交付物），但 Toolbar 的「新建图表」按钮调用 `dashboard.openBuilder('create')`，搭建器弹窗留空即可

**组装代码参考**技术文档 4.12 节。

### 验收标准

- [ ] 首次访问（localStorage 为空）→ 显示 3 个默认图表，位置与需求文档五.5 节一致
- [ ] localStorage 存入无效数据 → 回退到默认看板
- [ ] 查看模式下卡片不可拖拽、不可缩放，无 ✎✕ 按钮
- [ ] 查看模式下图表类型切换按钮仍可用
- [ ] 点击「编辑仪表盘」→ 工具栏切换为 4 个按钮，卡片出现虚线边框
- [ ] 编辑模式下拖拽卡片 → 位置变化
- [ ] 编辑模式下缩放卡片 → 尺寸变化，最小 4 列 × 4 行
- [ ] 编辑模式下点击 ✕ → 卡片删除
- [ ] 点击「保存」→ 退出编辑模式，刷新页面后布局保持
- [ ] 点击「取消」→ 退出编辑模式，布局恢复到进入编辑前的状态
- [ ] 点击「恢复默认」→ 看板回到 3 个预设图表，仍在编辑模式
- [ ] KPI 卡片和状态汇总区域功能不受影响
- [ ] 其他页面（产线/设备/质量/工单）功能不受影响
- [ ] `npx vitest run src/hooks/__tests__/useDashboard.test.ts` 全部通过

---

## Task 3：图表搭建器

> **用户场景**：用户在编辑模式下点击「新建图表」，打开搭建器弹窗；选择数据源、维度、指标、聚合方式、图表类型后实时预览；确认后新图表出现在看板顶部。也可点击已有图表的 ✎ 按钮编辑配置。

| 字段 | 内容 |
|------|------|
| 负责角色 | 前端开发 |
| 预计工时 | 2 天 |
| 前置依赖 | Task 1（类型/常量/API/图表组件/聚合函数） |
| 可并行 | 与 Task 2 并行开发 |

### 交付物

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/dashboard/ChartBuilder.tsx` | 新增 | 图表搭建器全屏弹窗 |
| `src/pages/Overview.tsx` | 修改 | 集成 ChartBuilder（在 Task 2 基础上追加） |
| `src/components/dashboard/__tests__/ChartBuilder.test.tsx` | 新增 | 搭建器测试 |

### 实现要求

#### 1. ChartBuilder 组件（`src/components/dashboard/ChartBuilder.tsx`）

**Props**（技术文档四.11 节）：
```typescript
interface ChartBuilderProps {
  open: boolean;
  mode: BuilderMode;
  editingConfig?: CardConfig;
  dataSources: DataSourceMeta[];
  onConfirm: (config: CardConfig) => void;
  onClose: () => void;
}
```

**弹窗实现**：使用 `@base-ui/react` 的 `Dialog` 组件（项目已有此依赖），900×640px 居中弹窗，`className="chart-builder-dialog"`。

**内部布局**（需求文档五.3 节）：

```
┌──────────────────────────────────────────────────────────────┐
│  新建图表 / 编辑图表                                     [✕]  │
├──────────────────────────────────────────────────────────────┤
│  [🏭产线数据] [⚙️设备数据] [🔍质量数据] [📋工单] [📈趋势]       │
├────────────────────┬─────────────────────────────────────────┤
│ 左侧 (w:240px)     │ 右侧                                    │
│                    │ [📊柱状图] [📈折线图] [🍩饼图]  标题:[___]  │
│ 维度（X 轴）        │                                         │
│ ● / ○ string 字段  │ ┌─────────────────────────────────────┐ │
│ (单选)             │ │      实时预览图表 (h=320px)           │ │
│                    │ │                                     │ │
│ 指标（Y 轴）        │ └─────────────────────────────────────┘ │
│ ☑ / ☐ number 字段  │                                         │
│ (多选)             │                                         │
│                    │                                         │
│ 聚合方式            │                                         │
│ [Select ▾]         │                                         │
├────────────────────┴─────────────────────────────────────────┤
│                                      [取消]  [添加到看板/更新]  │
└──────────────────────────────────────────────────────────────┘
```

**内部状态**：
```typescript
const [selectedDsId, setSelectedDsId] = useState<string>('');
const [groupByField, setGroupByField] = useState<string>('');
const [valueFields, setValueFields] = useState<string[]>([]);
const [chartType, setChartType] = useState<ChartType>('bar');
const [aggregation, setAggregation] = useState<AggregationType>('none');
const [title, setTitle] = useState('');
```

**交互逻辑**（严格对应需求文档五.3 节交互细节表）：

| 交互 | 行为 |
|------|------|
| 打开（新建模式） | 默认选中第一个数据源，自动勾选第一个 string 字段为维度 + 前两个 number 字段为指标，右侧立即显示预览 |
| 打开（编辑模式） | 从 editingConfig 预填所有字段 |
| 切换数据源 Tab | 清空字段，自动选中新数据源默认字段，重置聚合为 none，清空标题 |
| 点击维度字段 | 单选替换，蓝色实心圆 ● 标记当前选中 |
| 勾选指标字段 | 多选切换，Checkbox ☑/☐ |
| 切换聚合方式 | 复用现有 Select 组件，选项来自 AGGREGATION_OPTIONS |
| 切换图表类型 | 3 个按钮，当前选中高亮 |
| 输入标题 | 为空时自动生成：`按{维度label}的{指标label1}/{指标label2}` |
| 「添加到看板」 | id = Date.now().toString()，调用 onConfirm，关闭 |
| 「更新」（编辑模式） | 复用 editingConfig.id，调用 onConfirm，关闭 |
| 确认按钮禁用条件 | 未选维度 或 未选任何指标 |

**实时预览**：
- `useRequest(getDatasourceData(selectedDsId))` 获取数据
- `aggregate()` 聚合
- 按 chartType 渲染 BarChart/LineChart/PieChart，height=320
- groupByField/valueFields/aggregation/chartType 任一变化时预览更新

#### 2. Overview 页面集成 ChartBuilder

在 Task 2 已改造的 Overview.tsx 基础上，追加 ChartBuilder 集成：

```typescript
import { ChartBuilder } from '@/components/dashboard';

// 在 useDashboard 已有的基础上
const { data: dataSources } = useRequest(getDatasources);

// 在 JSX 中追加
<ChartBuilder
  open={dashboard.builder.open}
  mode={dashboard.builder.mode}
  editingConfig={
    dashboard.builder.editingCardId
      ? dashboard.cards.find(c => c.config.id === dashboard.builder.editingCardId)?.config
      : undefined
  }
  dataSources={dataSources ?? []}
  onConfirm={(config) => {
    if (dashboard.builder.mode === 'create') {
      dashboard.addCard(config);
    } else {
      dashboard.updateCard(config);
    }
  }}
  onClose={dashboard.closeBuilder}
/>
```

同时确保 DashboardGrid 的 `onEditCard` 回调连接到 `dashboard.openBuilder('edit', cardId)`。

### 验收标准

- [ ] 编辑模式点击「新建图表」→ 弹窗打开，默认显示产线数据，维度=产线名称，指标=计划产量+实际产量，右侧显示柱状图预览
- [ ] 切换到「设备数据」Tab → 字段重置，维度=设备名称，指标=稼动率+性能率，预览更新
- [ ] 切换到「质量数据」Tab → 维度=产线，指标=不良数量
- [ ] 切换到「工单数据」Tab → 维度=产品型号，指标=计划数量+已完成数量
- [ ] 切换到「不良趋势-周」Tab → 维度=日期，指标=检验数量+不良数
- [ ] 点击不同维度字段 → 单选替换，预览更新
- [ ] 勾选/取消指标字段 → 多选，预览实时更新
- [ ] 选择聚合方式"求和" → 预览数据聚合后更新
- [ ] 切换图表类型为折线图 → 预览变为折线图
- [ ] 切换图表类型为饼图 → 预览变为环形图
- [ ] 标题为空时底部按钮旁/预览上方显示自动生成标题
- [ ] 手动输入标题后使用用户输入
- [ ] 未选维度或指标时「添加到看板」按钮禁用
- [ ] 点击「添加到看板」→ 新卡片出现在看板最顶部（y=0），已有卡片下移
- [ ] 编辑模式点击卡片 ✎ → 弹窗打开，所有配置预填正确
- [ ] 修改配置后点击「更新」→ 卡片内容更新，位置不变
- [ ] 点击「取消」→ 弹窗关闭，看板不变

---

## 三个任务间的接口契约

Task 2 和 Task 3 并行开发时，双方依赖的接口已在技术文档中完全定义，此处汇总关键约定：

### useDashboard Hook（Task 2 产出，Task 3 消费）

Task 3 需要使用的方法：

```typescript
// Task 3 需要的 —— 搭建器控制
dashboard.builder          // BuilderState { open, mode, editingCardId }
dashboard.openBuilder()    // Task 2 从 DashboardGrid.onEditCard 调用
dashboard.closeBuilder()   // Task 3 的 ChartBuilder.onClose 调用

// Task 3 需要的 —— 卡片操作
dashboard.addCard(config)     // 新建确认时调用
dashboard.updateCard(config)  // 编辑确认时调用
dashboard.cards               // 查找 editingCardId 对应的 config
```

### ChartCard（Task 1 产出，Task 2 和 Task 3 消费）

```typescript
// Props 接口固定
interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChartTypeChange: (type: ChartType) => void;
}
```

### Overview 页面合并策略

Task 2 和 Task 3 都会修改 `src/pages/Overview.tsx`：

- **Task 2** 负责主体改造：删除固定表格，集成 useDashboard + DashboardToolbar + DashboardGrid
- **Task 3** 负责追加：在 Task 2 基础上集成 ChartBuilder 弹窗

如并行开发，建议 **Task 2 先合入主分支**，Task 3 在其基础上追加。或 Task 3 先在独立文件开发 ChartBuilder，最后统一集成。

---

## 任务进度跟踪表

| Task | 任务名称 | 负责人 | 状态 | 开始日期 | 完成日期 |
|------|---------|--------|------|---------|---------|
| 1 | 基础设施 + 看板渲染 | | 未开始 | | |
| 2 | 看板编辑 | | 未开始 | | |
| 3 | 图表搭建器 | | 未开始 | | |
