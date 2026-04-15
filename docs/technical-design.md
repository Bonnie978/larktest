# 智造云 · 自助式可视化仪表盘 技术方案文档

| 字段 | 内容 |
|------|------|
| 产品名称 | 智造云 · 生产运营管理平台 |
| 文档版本 | v1.0 |
| 文档类型 | 技术方案 |
| 对应需求 | 生产概览页 - 自助式可视化仪表盘 |
| 需求优先级 | P0 |

---

## 一、现有系统分析

### 1.1 技术栈现状

| 层级 | 技术选型 | 版本 |
|------|---------|------|
| 前端框架 | React + TypeScript | React 19.2, TS ~6.0 |
| 构建工具 | Vite | 8.0 |
| 样式方案 | Tailwind CSS 4.2 + CSS Variables（火山引擎主题） | 4.2 |
| UI 组件库 | shadcn/ui（Base UI React 底层） | 4.2 |
| 图标库 | Lucide React | 1.8 |
| 路由 | React Router DOM | 6.30 |
| 后端框架 | Express (Node.js) | 4.21 |
| 开发工具 | concurrently（前后端并行启动） | 9.2 |
| 测试框架 | Vitest + React Testing Library | Vitest 4.1, RTL 16.3 |
| 运行端口 | 前端 :5173 / 后端 :3001 | — |

### 1.2 项目目录结构现状

```
larktest/
├── index.html                          # 入口 HTML
├── vite.config.ts                      # Vite 配置（含 Vitest）
├── tsconfig.json / tsconfig.app.json   # TypeScript 配置
├── components.json                     # shadcn/ui 配置
├── package.json                        # 根依赖
├── src/
│   ├── main.tsx                        # React 入口
│   ├── App.tsx                         # 路由配置（React.lazy 懒加载）
│   ├── index.css                       # 全局样式 + 主题变量
│   ├── layouts/
│   │   ├── MainLayout.tsx              # 根布局（Sidebar + Header + Outlet）
│   │   ├── Sidebar.tsx                 # 侧边栏导航（可折叠，5 个菜单项）
│   │   └── Header.tsx                  # 顶部栏（工厂名称、班次、通知、用户）
│   ├── pages/
│   │   ├── Overview.tsx                # 生产概览页（KPI 卡片 + 状态汇总 + 表格）
│   │   ├── Lines.tsx                   # 产线管理（表格 + Drawer 详情）
│   │   ├── Equipment.tsx               # 设备管理（多筛选条件 + 表格）
│   │   ├── Quality.tsx                 # 质量管理（多筛选 + 可展开行表格）
│   │   └── Orders.tsx                  # 工单管理（表格）
│   ├── components/
│   │   ├── KPICard.tsx                 # KPI 数字卡片
│   │   ├── Table.tsx                   # 通用表格（支持排序/展开/行点击）
│   │   ├── Tag.tsx                     # 状态标签（success/warning/danger/default）
│   │   ├── Drawer.tsx                  # 右侧抽屉（基于 Sheet）
│   │   ├── Select.tsx                  # 下拉筛选器（含"全部"选项）
│   │   ├── ui/                         # shadcn/ui 基础组件
│   │   │   ├── card.tsx                # Card 系列（Card/Header/Title/Content/Footer/Action）
│   │   │   ├── button.tsx              # Button（多变体 + 尺寸）
│   │   │   ├── badge.tsx               # Badge
│   │   │   ├── table.tsx               # HTML 表格封装
│   │   │   ├── sheet.tsx               # Sheet/Drawer 弹层（4 方向）
│   │   │   ├── select.tsx              # Select 下拉
│   │   │   └── separator.tsx           # 分割线
│   │   └── __tests__/
│   │       ├── KPICard.test.tsx         # KPICard 渲染测试（3 个用例）
│   │       ├── Table.test.tsx           # Table 功能测试（5 个用例）
│   │       ├── Drawer.test.tsx          # 空桩
│   │       ├── Select.test.tsx          # 空桩
│   │       └── Tag.test.tsx             # 空桩
│   ├── api/
│   │   ├── request.ts                  # 基础请求函数（fetch + 统一响应解包）
│   │   └── index.ts                    # API 函数集合（8 个接口调用）
│   ├── hooks/
│   │   └── useRequest.ts              # 通用数据请求 Hook（loading/error/refresh）
│   ├── mock/
│   │   ├── types.ts                    # 前端类型定义（7 个 interface）
│   │   ├── production.ts / lines.ts / equipment.ts / quality.ts / orders.ts
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts                    # cn() 工具函数（clsx + tailwind-merge）
│   └── test/
│       └── setup.ts                    # Vitest 初始化
└── server/
    ├── package.json                    # 后端依赖
    ├── tsconfig.json                   # 后端 TS 配置（ES2022, ESNext）
    └── src/
        ├── index.ts                    # Express 入口（CORS + 5 个路由挂载）
        ├── routes/
        │   ├── production.ts           # GET /api/production/kpi|lines|defects
        │   ├── lines.ts                # GET /api/lines, GET /api/lines/:id
        │   ├── equipment.ts            # GET /api/equipment（支持 lineId/status 筛选）
        │   ├── quality.ts              # GET /api/quality（支持 lineName/defectType/status 筛选）
        │   └── orders.ts              # GET /api/orders
        └── mock/
            ├── types.ts                # 后端类型定义（与前端镜像）
            ├── production.ts           # KPI 5条 + 产线产量 5条 + 周不良 7条
            ├── lines.ts                # 产线 5条（含小时产量数组）
            ├── equipment.ts            # 设备 18台
            ├── quality.ts              # 质量记录 18条
            └── orders.ts              # 工单 12条
```

### 1.3 现有 API 接口清单

| 方法 | 路径 | 用途 | 筛选参数 |
|------|------|------|---------|
| GET | `/api/production/kpi` | KPI 指标 | 无 |
| GET | `/api/production/lines` | 产线产量 | 无 |
| GET | `/api/production/defects` | 周不良汇总 | 无 |
| GET | `/api/lines` | 产线列表 | 无 |
| GET | `/api/lines/:id` | 产线详情 | 无 |
| GET | `/api/equipment` | 设备列表 | lineId, status |
| GET | `/api/quality` | 质量记录 | lineName, defectType, status |
| GET | `/api/orders` | 工单列表 | 无 |

### 1.4 现有数据模型（TypeScript Interface）

```typescript
// src/mock/types.ts — 前后端共用定义

interface KPIData {
  label: string; value: string; unit?: string;
}

interface ProductionLine {
  id: string; name: string; workshop: string; shiftMode: string;
  currentShift: string; staffCount: number;
  status: '运行中' | '停机' | '维保';
  hourlyOutput: { hour: string; output: number }[];
  currentOrder: string;
}

interface Equipment {
  id: string; name: string; lineId: string; lineName: string; type: string;
  availability: number; performance: number; quality: number; oee: number;
  status: '运行中' | '停机' | '维修中' | '待机';
}

interface QualityRecord {
  id: string; batchNo: string; lineId: string; lineName: string;
  defectType: '尺寸超差' | '外观划伤' | '焊接虚焊' | '装配错误' | '功能失效';
  defectCount: number; inspector: string; occurTime: string;
  status: '待处理' | '处理中' | '已关闭';
  description: string; resolution: string;
}

interface WorkOrder {
  id: string; productModel: string; customer: string;
  plannedQty: number; completedQty: number;
  plannedStart: string; plannedEnd: string; actualEnd: string | null;
  deliveryStatus: '准时' | '延期' | '风险' | '进行中';
}

interface LineProductionRow {
  lineId: string; lineName: string; shift: string;
  planned: number; actual: number; completionRate: number;
  status: '正常' | '预警' | '异常';
}

interface WeeklyDefectRow {
  date: string; inspectedQty: number; defectQty: number;
  defectRate: number; mainDefectType: string;
}
```

### 1.5 现有组件能力盘点

| 组件 | 文件 | 核心能力 | 可复用性 |
|------|------|---------|---------|
| KPICard | `src/components/KPICard.tsx` | 展示 label/value/unit 数字指标 | 直接复用，概览页 KPI 区无需改动 |
| Table | `src/components/Table.tsx` | 泛型表格，支持自定义 render、行点击、可展开行 | 直接复用，概览页固定表格区无需改动 |
| Tag | `src/components/Tag.tsx` | 4 种状态色标签（基于 Badge） | 直接复用 |
| Drawer | `src/components/Drawer.tsx` | 右侧 Sheet 抽屉 | 不直接用于仪表盘，但可参考弹层模式 |
| Select | `src/components/Select.tsx` | 下拉筛选，含"全部"选项 | 可复用于搭建器中的聚合方式选择 |
| Card (shadcn) | `src/components/ui/card.tsx` | 卡片容器 | 图表卡片外壳直接复用 |
| Button (shadcn) | `src/components/ui/button.tsx` | 按钮（多变体） | 工具栏按钮直接复用 |
| Sheet (shadcn) | `src/components/ui/sheet.tsx` | 全屏/半屏弹层 | 搭建器弹窗可基于此实现 |

### 1.6 状态管理模式

当前项目**未使用全局状态管理库**（无 Redux/Zustand/Context），采用：
- **useState**：组件级 UI 状态（筛选条件、抽屉开关）
- **useRequest**（自定义 Hook）：数据请求状态（data/loading/error/refresh），通过 deps 数组触发重请求
- **useCallback**：稳定化请求函数引用，避免 useRequest 无限循环

此模式足以满足仪表盘需求，不需引入全局状态库。

### 1.7 样式体系

| 项目 | 当前实现 |
|------|---------|
| 主色 | `--primary: #1664FF`（与需求文档图表色板色 1 一致） |
| 图表色变量 | `--chart-1` ~ `--chart-5` 已定义（#1664FF, #00B42A, #FF7D00, #F53F3F, #722ED1） |
| 状态色 | success #00B42A / warning #FF7D00 / danger #F53F3F 已定义 |
| 背景色 | `--background: #F2F3F5`，卡片 `--card: #FFFFFF` |
| 边框色 | `--border: #E5E6EB` |
| 文字色 | 主文字 `--foreground: #1D2129`，辅助 `--muted-foreground: #86909C` |
| 圆角 | 基准 `--radius: 0.5rem`（8px），含 sm/md/lg/xl 等级 |
| 字体 | PingFang SC 系列，基准 14px |

**需求文档要求的 8 色图表色板**（#1664FF, #14C9C9, #78D3F8, #9FDB1D, #F7BA1E, #722ED1, #F53F3F, #FF7D00）与现有 5 色不完全匹配，需扩展 CSS 变量。

---

## 二、需求与现状差距分析（GAP Analysis）

### 2.1 功能差距

| 需求功能 | 现状 | 差距 | 工作量评估 |
|---------|------|------|-----------|
| **图表可视化渲染** | 无图表库，仅表格展示 | 需引入 Recharts 图表库 | 中 |
| **图表搭建器弹窗** | 无 | 需新建全屏弹窗组件（数据源选择 + 字段配置 + 预览） | 大 |
| **拖拽网格看板** | 无 | 需引入 react-grid-layout | 大 |
| **看板编辑/查看模式** | 无 | 需新增模式状态管理和工具栏 | 中 |
| **布局持久化** | 无 | 需实现 localStorage 读写 + 容错 | 小 |
| **前端数据聚合** | 无 | 需实现 sum/avg/count/max/none 纯函数 | 小 |
| **数据源元数据 API** | 无（现有 API 返回具体数据，无元数据描述） | 需新增 `/api/datasource` 和 `/api/datasource/:id/data` | 中 |
| **卡片图表类型切换** | 无 | 需在卡片头部实现类型切换按钮组 | 小 |
| **默认看板配置** | 无 | 需定义 3 个预设图表配置 | 小 |

### 2.2 数据模型差距

| 需求数据源 | 现有对应 | 字段映射差异 |
|-----------|---------|-------------|
| `line-production` | `lineProductionData`（5条） | 现有有 lineId/status 字段，需求无；需求有 shift 字段，现有有 |
| `equipment` | `equipmentList`（18条） | 现有有 lineId 字段，需求仅有 lineName；需求无 id 字段，现有有 |
| `quality` | `qualityRecords`（18条） | 现有有 batchNo/lineId/occurTime/description/resolution 等额外字段 |
| `orders` | `workOrders`（12条） | 现有有 plannedStart/plannedEnd/actualEnd 等额外字段 |
| `weekly-defects` | `weeklyDefectData`（7条） | 现有字段完全匹配需求 |

**结论**：现有 mock 数据是需求数据源的超集，新 API 通过 `fields` 参数做字段投影即可。

### 2.3 需要新增的依赖

| 依赖 | 用途 | 推荐版本 |
|------|------|---------|
| `recharts` | 图表渲染（柱状图/折线图/饼图） | 2.15.0 |
| `react-grid-layout` | 拖拽网格布局 | 1.5.0 |
| `@types/react-grid-layout` | 类型定义 | 1.5.0 |

#### 依赖 API 验证

安装完成后，开发者必须执行以下验证命令确认 API 可用：

**react-grid-layout 验证**：
```bash
node -e "const rgl = require('react-grid-layout');
console.log('GridLayout:', typeof rgl.GridLayout);
console.log('useContainerWidth:', typeof rgl.useContainerWidth);
console.log('WidthProvider:', typeof rgl.WidthProvider);"
```
预期输出：`GridLayout: function, useContainerWidth: function, WidthProvider: undefined`

> ⚠️ 注意：`WidthProvider` 在当前版本已移除，文档中所有用法均基于 `useContainerWidth` + `GridLayout`。

---

## 三、整体架构设计

### 3.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Overview Page (概览页)                    │
├──────────────────┬──────────────────────────────────────────┤
│  固定区域（不参与拖拽）│                                         │
│  ┌──────────────┐│                                         │
│  │ KPI 卡片 ×5  ││   拖拽网格区域 (DashboardGrid)             │
│  │ (KPICard)    ││   ┌─────────────────────────────────┐   │
│  ├──────────────┤│   │  react-grid-layout               │   │
│  │ 状态汇总 ×4  ││   │  ┌──────────┐ ┌──────────┐      │   │
│  │ (Card)       ││   │  │ChartCard │ │ChartCard │      │   │
│  └──────────────┘│   │  │ Recharts │ │ Recharts │      │   │
│                  │   │  └──────────┘ └──────────┘      │   │
│                  │   │  ┌──────────┐                    │   │
│                  │   │  │ChartCard │                    │   │
│                  │   │  └──────────┘                    │   │
│                  │   └─────────────────────────────────┘   │
│                  │                                         │
│                  │   工具栏 (DashboardToolbar)               │
│                  │   [编辑仪表盘] / [新建图表][恢复默认][取消][保存] │
├──────────────────┴──────────────────────────────────────────┤
│                                                             │
│  图表搭建器弹窗 (ChartBuilder)                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  数据源 Tabs → 字段选择面板 → 图表配置 → 实时预览       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     API Layer                                │
│  request.ts → GET /api/datasource                           │
│             → GET /api/datasource/:id/data                  │
├─────────────────────────────────────────────────────────────┤
│                     Express Server                           │
│  routes/datasource.ts → mock data (5 个数据源)               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 前端模块架构

```
src/
├── pages/
│   └── Overview.tsx                      # 改造：集成仪表盘区域
├── components/
│   ├── dashboard/                        # 新增：仪表盘模块
│   │   ├── DashboardGrid.tsx             # 拖拽网格容器
│   │   ├── DashboardToolbar.tsx          # 编辑/查看模式工具栏
│   │   ├── ChartCard.tsx                 # 图表卡片（含 Recharts 渲染）
│   │   └── ChartBuilder.tsx             # 图表搭建器弹窗
│   └── charts/                           # 新增：图表渲染组件
│       ├── BarChart.tsx                  # 柱状图封装
│       ├── LineChart.tsx                 # 折线图封装
│       └── PieChart.tsx                  # 饼图（环形图）封装
├── hooks/
│   ├── useRequest.ts                     # 复用
│   └── useDashboard.ts                  # 新增：仪表盘状态管理 Hook
├── utils/
│   └── aggregation.ts                   # 新增：前端聚合计算纯函数
├── types/
│   └── dashboard.ts                     # 新增：仪表盘相关类型定义
└── constants/
    └── dashboard.ts                     # 新增：默认看板配置 + 图表色板
```

### 3.3 数据流架构

```
                    ┌──────────────┐
                    │  localStorage │
                    │ "dashboard-v2"│
                    └──────┬───────┘
                           │ 读取/写入
                    ┌──────▼───────┐
                    │ useDashboard │ ← 核心状态管理
                    │   Hook       │
                    └──┬──┬──┬─────┘
           ┌───────────┘  │  └───────────┐
           ▼              ▼              ▼
    ┌──────────┐  ┌──────────────┐  ┌──────────┐
    │ Toolbar  │  │ DashboardGrid│  │  Builder  │
    │          │  │              │  │           │
    │ 模式切换  │  │ react-grid   │  │ 数据源选择 │
    │ 保存/取消 │  │ -layout      │  │ 字段配置   │
    │ 恢复默认  │  │              │  │ 预览渲染   │
    └──────────┘  │  ┌────────┐  │  └─────┬─────┘
                  │  │ChartCard│  │        │
                  │  │        │  │        │ 配置提交
                  │  │Recharts│  │        ▼
                  │  └────────┘  │  ┌──────────┐
                  └──────────────┘  │ CardConfig│
                         ▲          └──────────┘
                         │
                  ┌──────┴───────┐
                  │ aggregation  │ ← 纯函数
                  │ (前端聚合)    │
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │ /api/datasource│
                  │ /:id/data     │
                  └──────────────┘
```

---

## 四、详细设计

### 4.1 新增类型定义

**文件：`src/types/dashboard.ts`**

```typescript
/** 图表类型 */
export type ChartType = 'bar' | 'line' | 'pie';

/** 聚合方式 */
export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'none';

/** 数据源字段定义 */
export interface DataSourceField {
  key: string;
  label: string;
  type: 'string' | 'number';
}

/** 数据源元数据 */
export interface DataSourceMeta {
  id: string;
  name: string;
  fields: DataSourceField[];
}

/** 图表卡片配置 */
export interface CardConfig {
  id: string;           // 唯一标识，新建时用 Date.now().toString()
  title: string;        // 图表标题
  dataSourceId: string; // 数据源 ID
  chartType: ChartType;
  groupByField: string; // X 轴分组维度字段 key
  valueFields: string[];// Y 轴数值字段 key 数组
  aggregation: AggregationType;
}

/** 网格位置 */
export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 看板卡片（配置 + 位置） */
export interface DashboardCard {
  config: CardConfig;
  grid: GridPosition;
}

/** localStorage 持久化结构 */
export interface DashboardLayout {
  version: 3;
  cards: DashboardCard[];
}

/** 搭建器模式 */
export type BuilderMode = 'create' | 'edit';

/** 搭建器状态 */
export interface BuilderState {
  open: boolean;
  mode: BuilderMode;
  editingCardId: string | null; // 编辑模式下的卡片 ID
}
```

### 4.2 常量定义

**文件：`src/constants/dashboard.ts`**

```typescript
import type { DashboardCard, AggregationType } from '@/types/dashboard';

/** localStorage 键名 */
export const STORAGE_KEY = 'dashboard-v2';

/** 持久化版本号 */
export const LAYOUT_VERSION = 3;

/** 拖拽网格配置 */

| 配置项 | 值 |
|-------|---|
| 列数 | 12 |
| 单元格高度 | 图表卡片默认能完整展示图表内容和图例，无明显空白 |
| 间距 | 12px |
| 最小卡片尺寸 | 约占页面宽度 1/3，高度能完整展示一个图表 |

/** 图表色板（需求文档 8 色） */
export const CHART_COLORS = [
  '#1664FF', // 主色
  '#14C9C9',
  '#78D3F8',
  '#9FDB1D',
  '#F7BA1E',
  '#722ED1',
  '#F53F3F',
  '#FF7D00',
];

/** 聚合方式选项 */
export const AGGREGATION_OPTIONS: { label: string; value: AggregationType }[] = [
  { label: '无聚合', value: 'none' },
  { label: '求和', value: 'sum' },
  { label: '平均值', value: 'avg' },
  { label: '计数', value: 'count' },
  { label: '最大值', value: 'max' },
];

/** 图表类型选项 */
export const CHART_TYPE_OPTIONS = [
  { label: '柱状图', value: 'bar' as const, icon: 'BarChart3' },
  { label: '折线图', value: 'line' as const, icon: 'TrendingUp' },
  { label: '饼图', value: 'pie' as const, icon: 'PieChart' },
];

/** 数据源 Tab 图标映射 */
export const DATASOURCE_ICONS: Record<string, string> = {
  'line-production': '🏭',
  'equipment': '⚙️',
  'quality': '🔍',
  'orders': '📋',
  'weekly-defects': '📈',
};

/** 默认看板（3 个预设图表） */
export const DEFAULT_DASHBOARD: DashboardCard[] = [
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
```

### 4.3 后端新增接口设计

**文件：`server/src/routes/datasource.ts`**

需新增 2 个 API 端点，复用现有 mock 数据：

#### 4.3.1 GET /api/datasource — 获取数据源元数据

```typescript
import { Router } from 'express';
import type { DataSourceField } from './types';

// 数据源元数据注册表
const datasourceRegistry = [
  {
    id: 'line-production',
    name: '产线数据',
    fields: [
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'shift', label: '班次', type: 'string' },
      { key: 'planned', label: '计划产量', type: 'number' },
      { key: 'actual', label: '实际产量', type: 'number' },
      { key: 'completionRate', label: '完成率', type: 'number' },
    ],
  },
  {
    id: 'equipment',
    name: '设备数据',
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
  {
    id: 'quality',
    name: '质量数据',
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
    name: '不良趋势-周',
    fields: [
      { key: 'date', label: '日期', type: 'string' },
      { key: 'mainDefectType', label: '主要不良类型', type: 'string' },
      { key: 'inspectedQty', label: '检验数量', type: 'number' },
      { key: 'defectQty', label: '不良数', type: 'number' },
      { key: 'defectRate', label: '不良率', type: 'number' },
    ],
  },
];
```

**响应格式**：
```json
{
  "code": 0,
  "data": [
    {
      "id": "line-production",
      "name": "产线数据",
      "fields": [
        { "key": "lineName", "label": "产线名称", "type": "string" },
        ...
      ]
    },
    ...
  ],
  "message": "success"
}
```

#### 4.3.2 GET /api/datasource/:id/data — 查询数据

**逻辑**：
1. 根据 `:id` 匹配数据源，不存在返回 404
2. 从现有 mock 数据取数（`line-production` → `lineProductionData`，`equipment` → `equipmentList`，等）
3. 若 query 有 `fields` 参数，做字段投影（仅返回指定字段）
4. 其他 query 参数作为等值筛选条件

**数据源与现有 mock 映射关系**：

| 数据源 ID | 现有 Mock 数据变量 | 来源文件 |
|-----------|-------------------|---------|
| `line-production` | `lineProductionData` | `server/src/mock/production.ts` |
| `equipment` | `equipmentList` | `server/src/mock/equipment.ts` |
| `quality` | `qualityRecords` | `server/src/mock/quality.ts` |
| `orders` | `workOrders` | `server/src/mock/orders.ts` |
| `weekly-defects` | `weeklyDefectData` | `server/src/mock/production.ts` |

**路由注册**：在 `server/src/index.ts` 中新增：
```typescript
import datasourceRouter from './routes/datasource.js';
app.use('/api/datasource', datasourceRouter);
```

### 4.4 前端 API 层扩展

**文件：`src/api/index.ts`** 新增：

```typescript
import type { DataSourceMeta } from '@/types/dashboard';

// 数据源元数据
export const getDatasources = () =>
  request<DataSourceMeta[]>('/datasource');

// 数据源数据查询
export const getDatasourceData = (id: string, params?: Record<string, string>) =>
  request<Record<string, any>[]>(`/datasource/${id}/data`, params);
```

### 4.5 前端聚合计算模块

**文件：`src/utils/aggregation.ts`**

```typescript
import type { AggregationType } from '@/types/dashboard';

/**
 * 前端数据聚合纯函数
 *
 * @param data         原始数据数组
 * @param groupByField 分组字段 key（X 轴）
 * @param valueFields  数值字段 key 数组（Y 轴）
 * @param aggregation  聚合方式
 * @returns            聚合后的数据数组
 */
export function aggregate(
  data: Record<string, any>[],
  groupByField: string,
  valueFields: string[],
  aggregation: AggregationType
): Record<string, any>[] {
  // 无聚合：直接透传，仅保留 groupByField + valueFields
  if (aggregation === 'none') {
    return data.map((row) => {
      const result: Record<string, any> = { [groupByField]: row[groupByField] };
      valueFields.forEach((f) => { result[f] = row[f]; });
      return result;
    });
  }

  // 步骤 1：按 groupByField 分组
  const groups = new Map<string, Record<string, any>[]>();
  data.forEach((row) => {
    const key = String(row[groupByField] ?? '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });

  // 步骤 2：对每组执行聚合
  const result: Record<string, any>[] = [];
  groups.forEach((rows, groupKey) => {
    const aggregated: Record<string, any> = { [groupByField]: groupKey };

    valueFields.forEach((field) => {
      const values = rows.map((r) => Number(r[field]) || 0);

      switch (aggregation) {
        case 'sum':
          aggregated[field] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregated[field] = values.length > 0
            ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
            : 0;
          break;
        case 'count':
          aggregated[field] = rows.length;
          break;
        case 'max':
          aggregated[field] = Math.max(...values);
          break;
      }
    });

    result.push(aggregated);
  });

  return result;
}
```

### 4.6 useDashboard Hook 设计

**文件：`src/hooks/useDashboard.ts`**

此 Hook 是仪表盘的核心状态管理单元，职责：

1. **看板状态管理**：cards 数组、编辑/查看模式
2. **持久化读写**：localStorage 读取 + 容错 + 保存
3. **搭建器状态**：open/close、新建/编辑模式
4. **网格布局同步**：与 react-grid-layout 的 layout 对象同步

```typescript
// Hook 签名
function useDashboard(): {
  // 状态
  cards: DashboardCard[];
  isEditing: boolean;
  builder: BuilderState;
  editingSnapshot: DashboardCard[] | null; // 取消时恢复用

  // 模式切换
  enterEditMode: () => void;
  cancelEdit: () => void;
  saveLayout: () => void;
  resetToDefault: () => void;

  // 卡片操作
  addCard: (config: CardConfig) => void;       // 新卡片置于 y=0
  updateCard: (config: CardConfig) => void;    // 更新已有卡片配置
  deleteCard: (cardId: string) => void;
  updateCardChartType: (cardId: string, chartType: ChartType) => void;

  // 网格布局
  onLayoutChange: (layout: ReactGridLayout.Layout[]) => void;

  // 搭建器
  openBuilder: (mode: BuilderMode, cardId?: string) => void;
  closeBuilder: () => void;
};
```

**持久化容错逻辑**（对应需求文档七.2 节）：

```typescript
function loadFromStorage(): DashboardCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DASHBOARD;

    const parsed = JSON.parse(raw) as DashboardLayout;
    if (parsed.version !== LAYOUT_VERSION) return DEFAULT_DASHBOARD; // LAYOUT_VERSION = 3
    if (!Array.isArray(parsed.cards)) return DEFAULT_DASHBOARD;

    return parsed.cards;
  } catch {
    return DEFAULT_DASHBOARD;
  }
}

function saveToStorage(cards: DashboardCard[]): void {
  const layout: DashboardLayout = { version: LAYOUT_VERSION, cards };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
}
```

**编辑模式快照机制**：
- `enterEditMode()`：深拷贝当前 cards 到 `editingSnapshot`
- `cancelEdit()`：从 `editingSnapshot` 恢复 cards，退出编辑模式
- `saveLayout()`：写入 localStorage，清空 `editingSnapshot`，退出编辑模式

**新卡片置顶逻辑**：
```typescript
function addCard(config: CardConfig): void {
  // 已有卡片整体下移 minH(4) 行
  const shifted = cards.map(c => ({
    ...c,
    grid: { ...c.grid, y: c.grid.y + GRID_CONFIG.minH },
  }));

  const newCard: DashboardCard = {
    config,
    grid: { x: 0, y: 0, w: 6, h: 4 },
  };

  setCards([newCard, ...shifted]);
}
```

### 4.7 DashboardToolbar 组件设计

**文件：`src/components/dashboard/DashboardToolbar.tsx`**

| 模式 | 显示按钮 | 行为 |
|------|---------|------|
| 查看模式 | `[编辑仪表盘]` | 调用 `enterEditMode()` |
| 编辑模式 | `[新建图表]` `[恢复默认]` `[取消]` `[保存]` | 分别调用对应方法 |

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

按钮样式复用现有 `Button` 组件：
- 「编辑仪表盘」：`variant="outline"` + 图标 `Settings`
- 「新建图表」：`variant="default"`（主色）+ 图标 `Plus`
- 「恢复默认」：`variant="outline"` + 图标 `RotateCcw`
- 「取消」：`variant="ghost"`
- 「保存」：`variant="default"`

### 4.8 DashboardGrid 组件设计

**文件：`src/components/dashboard/DashboardGrid.tsx`**

```typescript
import { GridLayout, useContainerWidth } from 'react-grid-layout';

// useContainerWidth() 返回 { width, containerRef, mounted, measureWidth }
// containerRef 需绑定到容器 div
const { width, containerRef } = useContainerWidth();

// 关键：rowHeight/cols/margin 等参数必须通过 gridConfig 对象传入，
// 不能作为独立 props（新版 API 变更）
const gridConfig = {
  cols: GRID_CONFIG.cols,
  rowHeight: GRID_CONFIG.rowHeight,
  margin: GRID_CONFIG.margin,
  containerPadding: GRID_CONFIG.containerPadding,
};

<div ref={containerRef}>
  {width > 0 && (
    <GridLayout
      layout={gridLayout}
      width={width}
      gridConfig={gridConfig}
      isDraggable={isEditing}
      isResizable={isEditing}
      onLayoutChange={onLayoutChange}
      draggableHandle=".drag-handle"
    >
      ...
    </GridLayout>
  )}
</div>
```

> **为什么用 GridLayout 而非 ResponsiveGridLayout**：ResponsiveGridLayout 内部缓存 layout 状态，当通过 `addCard`/`deleteCard` 动态增删卡片时，`layouts` prop 变化不会同步到内部状态，导致新卡片不渲染。GridLayout 的 `layout` prop 是完全受控的，没有此问题。

**编辑模式卡片边框**：主色虚线边框，低透明度，区分编辑状态

**需引入 react-grid-layout 样式**：
```typescript
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
```

### 4.9 ChartCard 组件设计

**文件：`src/components/dashboard/ChartCard.tsx`**

```typescript
interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChartTypeChange: (type: ChartType) => void;
}
```

**卡片内部结构**：
```
┌──────────────────────────────────────┐
│ 标题              [📊][📈][🍩] [✎][✕] │  ← 头部
├──────────────────────────────────────┤
│                                      │
│         Recharts 图表区域             │  ← height="100%"，flex 自适应
│         (BarChart/LineChart/PieChart) │
│                                      │
└──────────────────────────────────────┘
```

- **标题**：左对齐显示 `config.title`
- **图表类型按钮组**：查看/编辑模式均显示，3 个图标按钮，当前类型高亮
- **编辑按钮 ✎**：仅编辑模式显示，蓝色圆形，`absolute top-2 right-10`
- **删除按钮 ✕**：仅编辑模式显示，红色圆形，`absolute top-2 right-2`
- **拖拽手柄**：头部区域设 `className="drag-handle"`，仅编辑模式 cursor=move

**图表高度策略**：
- 卡片内图表：`height="100%"`，通过 flex 布局自适应填满卡片剩余空间
- 搭建器预览：固定 `height={320}`，因为弹窗尺寸固定
- ChartProps 的 height 类型改为 `number | string`，默认值 `'100%'`

**数据获取与聚合流程**：
```typescript
// 在 ChartCard 内部
const { data: rawData } = useRequest(
  () => getDatasourceData(config.dataSourceId),
  [config.dataSourceId]
);

const chartData = useMemo(() => {
  if (!rawData) return [];
  return aggregate(rawData, config.groupByField, config.valueFields, config.aggregation);
}, [rawData, config.groupByField, config.valueFields, config.aggregation]);
```

### 4.10 图表渲染组件设计

#### 4.10.1 BarChart（柱状图）

**文件：`src/components/charts/BarChart.tsx`**

```typescript
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface BarChartProps {
  data: Record<string, any>[];
  groupByField: string;
  valueFields: string[];
  fieldLabels: Record<string, string>; // key → 显示名映射
  height?: number | string; // 默认 '100%'
}
```

**样式配置（对应需求文档九.2 节）**：

| 配置项 | 视觉效果 |
|-------|---------|
| 坐标轴文字 | 辅助色（灰色）小号字体 |
| 网格线 | 浅色虚线，不抢占视觉注意力 |
| Tooltip | 白色背景，浅灰色边框，带圆角 |
| 图表高度 | 自适应填满卡片可用空间，无明显空白；搭建器预览区约占弹窗高度 50% |
| 柱状图 | 顶部带小圆角 |
| 折线图 | 中等粗细线条，数据点可见，鼠标悬停时数据点放大 |
| 饼图 | 环形图，内外环比例约 1:2，标签显示名称+百分比，图形及标签不超出卡片边界 |

### 4.11 ChartBuilder（图表搭建器）组件设计

**文件：`src/components/dashboard/ChartBuilder.tsx`**

#### 4.11.1 组件接口

```typescript
interface ChartBuilderProps {
  open: boolean;
  mode: BuilderMode;
  editingConfig?: CardConfig;           // 编辑模式：预填的配置
  dataSources: DataSourceMeta[];        // 数据源元数据列表
  onConfirm: (config: CardConfig) => void;
  onClose: () => void;
}
```

#### 4.11.2 内部状态

```typescript
// 数据源选择
const [selectedDsId, setSelectedDsId] = useState(editingConfig?.dataSourceId || dataSources[0]?.id);

// 字段选择
const [groupByField, setGroupByField] = useState<string>('');      // 维度（单选）
const [valueFields, setValueFields] = useState<string[]>([]);       // 指标（多选）

// 图表配置
const [chartType, setChartType] = useState<ChartType>(editingConfig?.chartType || 'bar');
const [aggregation, setAggregation] = useState<AggregationType>(editingConfig?.aggregation || 'none');
const [title, setTitle] = useState(editingConfig?.title || '');
```

#### 4.11.3 布局（全屏弹窗 900×640px）

基于现有 `Sheet` 组件无法满足全屏固定尺寸弹窗需求（Sheet 是从边缘滑入），需使用 `@base-ui/react` 的 `Dialog` 组件直接实现居中弹窗：

```
┌──────────────────────────────────────────────────────────────┐
│  标题（新建图表/编辑图表）                               [✕]   │
├──────────────────────────────────────────────────────────────┤
│  [Tab: 🏭产线数据] [Tab: ⚙️设备数据] [Tab: 🔍质量数据] ...      │
├────────────────────┬─────────────────────────────────────────┤
│ 左侧面板 (w:240px) │ 右侧面板                                 │
│                    │ ┌─────────────────────────────────────┐ │
│ 维度（X 轴）        │ │ [📊柱状图] [📈折线图] [🍩饼图]         │ │
│ ● lineName         │ │                     标题: [______]  │ │
│   shift            │ ├─────────────────────────────────────┤ │
│                    │ │                                     │ │
│ 指标（Y 轴）        │ │       实时预览图表 (h:320px)          │ │
│ ☑ planned          │ │       <BarChart/LineChart/PieChart>  │ │
│ ☑ actual           │ │                                     │ │
│   completionRate   │ │                                     │ │
│                    │ └─────────────────────────────────────┘ │
│ 聚合方式            │                                         │
│ [Select: 无聚合 ▾]  │                                         │
├────────────────────┴─────────────────────────────────────────┤
│                                     [取消]  [添加到看板/更新]   │
└──────────────────────────────────────────────────────────────┘
```

#### 4.11.4 交互逻辑细节

**打开搭建器默认行为**（新建模式）：
```typescript
useEffect(() => {
  if (!open || mode === 'edit') return;

  // 默认选中第一个数据源
  const ds = dataSources[0];
  setSelectedDsId(ds.id);

  // 自动选中第一个 string 字段为维度
  const firstString = ds.fields.find(f => f.type === 'string');
  if (firstString) setGroupByField(firstString.key);

  // 自动选中前两个 number 字段为指标
  const numbers = ds.fields.filter(f => f.type === 'number');
  setValueFields(numbers.slice(0, 2).map(f => f.key));
}, [open, mode, dataSources]);
```

**切换数据源 Tab**：
```typescript
function handleDatasourceChange(dsId: string) {
  setSelectedDsId(dsId);
  const ds = dataSources.find(d => d.id === dsId)!;

  // 清空已选字段，重新自动选择
  const firstString = ds.fields.find(f => f.type === 'string');
  setGroupByField(firstString?.key || '');

  const numbers = ds.fields.filter(f => f.type === 'number');
  setValueFields(numbers.slice(0, 2).map(f => f.key));

  // 重置聚合
  setAggregation('none');
  // 清空标题（让自动生成逻辑接管）
  setTitle('');
}
```

**维度字段点击**（单选）：
```typescript
function handleGroupByClick(fieldKey: string) {
  setGroupByField(fieldKey); // 替换，不累加
}
```

**指标字段勾选**（多选）：
```typescript
function handleValueToggle(fieldKey: string) {
  setValueFields(prev =>
    prev.includes(fieldKey)
      ? prev.filter(k => k !== fieldKey)
      : [...prev, fieldKey]
  );
}
```

**自动标题生成**：
```typescript
const autoTitle = useMemo(() => {
  if (title) return title;
  const ds = dataSources.find(d => d.id === selectedDsId);
  if (!ds) return '';
  const dimLabel = ds.fields.find(f => f.key === groupByField)?.label || '';
  const valLabels = valueFields
    .map(k => ds.fields.find(f => f.key === k)?.label || k)
    .join('/');
  return `按${dimLabel}的${valLabels}`;
}, [title, selectedDsId, groupByField, valueFields, dataSources]);
```

**确认提交**：
```typescript
function handleConfirm() {
  const config: CardConfig = {
    id: mode === 'edit' ? editingConfig!.id : Date.now().toString(),
    title: title || autoTitle,
    dataSourceId: selectedDsId,
    chartType,
    groupByField,
    valueFields,
    aggregation,
  };
  onConfirm(config);
  onClose();
}
```

### 4.12 Overview 页面改造

**文件：`src/pages/Overview.tsx`**

改造策略：保持现有 KPI 卡片 + 状态汇总区域不变，**移除底部的两个固定表格**，替换为可拖拽仪表盘区域。

```typescript
// 改造后的结构
export default function Overview() {
  // ... 现有 KPI 和状态汇总逻辑保持不变 ...

  const dashboard = useDashboard();
  const { data: dataSources } = useRequest(getDatasources);

  return (
    <div className="p-6 space-y-5">
      {/* === 固定区域 === */}
      {/* 标题栏 + 日期 + 编辑按钮 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">生产概览</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{today}</span>
          <DashboardToolbar
            isEditing={dashboard.isEditing}
            onEnterEdit={dashboard.enterEditMode}
            onNewChart={() => dashboard.openBuilder('create')}
            onReset={dashboard.resetToDefault}
            onCancel={dashboard.cancelEdit}
            onSave={dashboard.saveLayout}
          />
        </div>
      </div>

      {/* KPI 卡片 ×5（不变） */}
      <div className="grid grid-cols-5 gap-4">
        {(kpiData ?? []).map((kpi, index) => (
          <KPICard key={index} label={kpi.label} value={kpi.value} unit={kpi.unit} />
        ))}
      </div>

      {/* 状态汇总 ×4（不变） */}
      <div className="grid grid-cols-4 gap-4">
        {/* ... 保持现有 4 个状态卡片 ... */}
      </div>

      {/* === 可拖拽仪表盘区域（新增） === */}
      <DashboardGrid
        cards={dashboard.cards}
        isEditing={dashboard.isEditing}
        onLayoutChange={dashboard.onLayoutChange}
        onEditCard={(id) => dashboard.openBuilder('edit', id)}
        onDeleteCard={dashboard.deleteCard}
        onChartTypeChange={dashboard.updateCardChartType}
      />

      {/* 图表搭建器弹窗（新增） */}
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
    </div>
  );
}
```

### 4.13 CSS 样式扩展

**文件：`src/index.css`** 新增内容：

```css
/* 图表色板扩展为 8 色（原 5 色 → 8 色） */
:root {
  --chart-1: #1664FF;
  --chart-2: #14C9C9;
  --chart-3: #78D3F8;
  --chart-4: #9FDB1D;
  --chart-5: #F7BA1E;
  --chart-6: #722ED1;
  --chart-7: #F53F3F;
  --chart-8: #FF7D00;
}

/* react-grid-layout 编辑模式卡片虚线边框 */
.dashboard-editing .react-grid-item {
  border: 1px dashed rgba(22, 100, 255, 0.3);
  border-radius: var(--radius-lg);
  transition: box-shadow 0.2s;
}

.dashboard-editing .react-grid-item:hover {
  box-shadow: 0 2px 8px rgba(22, 100, 255, 0.15);
}

/* 拖拽占位符样式 */
.react-grid-item.react-grid-placeholder {
  background: rgba(22, 100, 255, 0.08) !important;
  border: 2px dashed rgba(22, 100, 255, 0.4) !important;
  border-radius: var(--radius-lg);
}

/* 搭建器弹窗固定尺寸 */
.chart-builder-dialog {
  width: 900px;
  max-height: 640px;
}
```

---

## 五、文件变更清单

### 5.1 新增文件

| 文件路径 | 类型 | 说明 |
|---------|------|------|
| `src/types/dashboard.ts` | 类型 | 仪表盘所有 TypeScript 类型定义 |
| `src/constants/dashboard.ts` | 常量 | 网格配置、色板、聚合选项、默认看板 |
| `src/utils/aggregation.ts` | 工具 | 前端数据聚合纯函数 |
| `src/hooks/useDashboard.ts` | Hook | 仪表盘核心状态管理 |
| `src/components/dashboard/DashboardToolbar.tsx` | 组件 | 编辑/查看模式工具栏 |
| `src/components/dashboard/DashboardGrid.tsx` | 组件 | react-grid-layout 拖拽网格容器 |
| `src/components/dashboard/ChartCard.tsx` | 组件 | 图表卡片（数据获取 + 聚合 + 渲染） |
| `src/components/dashboard/ChartBuilder.tsx` | 组件 | 图表搭建器全屏弹窗 |
| `src/components/charts/BarChart.tsx` | 组件 | Recharts 柱状图封装 |
| `src/components/charts/LineChart.tsx` | 组件 | Recharts 折线图封装 |
| `src/components/charts/PieChart.tsx` | 组件 | Recharts 饼图封装 |
| `server/src/routes/datasource.ts` | 路由 | 数据源元数据 + 数据查询 API |

### 5.2 修改文件

| 文件路径 | 变更内容 |
|---------|---------|
| `package.json` | 新增 recharts、react-grid-layout、@types/react-grid-layout 依赖 |
| `src/index.css` | 扩展图表色变量（5→8 色）+ react-grid-layout 样式 |
| `src/api/index.ts` | 新增 getDatasources、getDatasourceData 两个 API 函数 |
| `src/pages/Overview.tsx` | 移除底部固定表格，集成 DashboardToolbar + DashboardGrid + ChartBuilder |
| `server/src/index.ts` | 新增 datasource 路由注册 |

### 5.3 无需修改的文件

| 文件/模块 | 原因 |
|----------|------|
| `src/components/KPICard.tsx` | 概览页 KPI 区域保持不变 |
| `src/components/Table.tsx` | 其他页面继续使用，概览页移除的表格不影响 |
| `src/components/Tag.tsx` | 无关联 |
| `src/components/Drawer.tsx` | 无关联 |
| `src/components/Select.tsx` | 搭建器聚合选择可复用，组件本身无需修改 |
| `src/hooks/useRequest.ts` | ChartCard 数据获取直接复用 |
| `src/api/request.ts` | 基础请求函数无需修改 |
| `src/layouts/*` | 布局层无需修改 |
| `src/App.tsx` | 路由无需修改 |
| `src/pages/Lines|Equipment|Quality|Orders.tsx` | 不涉及 |
| `server/src/routes/production|lines|equipment|quality|orders.ts` | 保持原有 API |
| `server/src/mock/*` | 新路由复用现有 mock 数据 |

---

## 六、组件依赖关系图

```
Overview.tsx
├── KPICard.tsx (×5) ────────────────── 不变
├── Card (×4 状态汇总) ──────────────── 不变
├── DashboardToolbar.tsx [新增]
│   └── Button (shadcn)
├── DashboardGrid.tsx [新增]
│   ├── react-grid-layout (GridLayout + useContainerWidth)
│   └── ChartCard.tsx [新增] (×N)
│       ├── Card (shadcn) ── 外壳
│       ├── useRequest ──── 数据获取
│       ├── getDatasourceData ── API
│       ├── aggregate() ── 聚合计算
│       ├── BarChart.tsx [新增]
│       │   └── recharts (BarChart, Bar, XAxis, YAxis, ...)
│       ├── LineChart.tsx [新增]
│       │   └── recharts (LineChart, Line, XAxis, YAxis, ...)
│       └── PieChart.tsx [新增]
│           └── recharts (PieChart, Pie, Cell, ...)
├── ChartBuilder.tsx [新增]
│   ├── Dialog (@base-ui/react)
│   ├── useRequest ──── 获取预览数据
│   ├── getDatasources ── API (数据源元数据)
│   ├── getDatasourceData ── API (预览数据)
│   ├── aggregate() ── 预览聚合
│   ├── Select (复用) ── 聚合方式下拉
│   ├── BarChart/LineChart/PieChart ── 预览图表
│   └── Button (shadcn) ── 确认/取消
└── useDashboard.ts [新增]
    ├── localStorage ── 持久化
    └── DEFAULT_DASHBOARD ── 默认配置
```

---

## 七、关键交互流程

### 7.1 首次访问流程

```
用户访问 /overview
    │
    ▼
useDashboard 初始化
    │
    ├── localStorage.getItem('dashboard-v2')
    │       │
    │       ├── null → 使用 DEFAULT_DASHBOARD (3 个预设图表)
    │       ├── JSON 解析失败 → DEFAULT_DASHBOARD
    │       ├── version ≠ 3 → DEFAULT_DASHBOARD
    │       ├── cards 非数组 → DEFAULT_DASHBOARD
    │       └── 正常 → 使用存储的配置
    │
    ▼
DashboardGrid 渲染
    │
    ▼
每个 ChartCard:
    ├── getDatasourceData(config.dataSourceId)
    ├── aggregate(data, groupByField, valueFields, aggregation)
    └── 渲染对应图表 (BarChart / LineChart / PieChart)
```

### 7.2 新建图表流程

```
[编辑模式] 用户点击「新建图表」
    │
    ▼
ChartBuilder 打开 (mode='create')
    │
    ├── 默认选中第一个数据源 (line-production)
    ├── 自动选中第一个 string 字段 (lineName) 为维度
    ├── 自动选中前两个 number 字段 (planned, actual) 为指标
    └── 右侧立即显示柱状图预览
    │
    ▼
用户交互（可选步骤）：
    ├── 切换数据源 Tab → 重置字段选择 + 预览更新
    ├── 点击维度字段 → 单选替换 + 预览更新
    ├── 勾选指标字段 → 多选切换 + 预览更新
    ├── 切换聚合方式 → 预览更新
    ├── 切换图表类型 → 预览更新
    └── 输入自定义标题（可选，不填则自动生成）
    │
    ▼
用户点击「添加到看板」
    │
    ├── 生成 CardConfig (id = Date.now().toString())
    ├── 已有卡片整体下移 4 行
    ├── 新卡片插入 (x:0, y:0, w:6, h:4)
    └── 关闭搭建器
```

### 7.3 编辑已有图表流程

```
[编辑模式] 用户点击卡片 ✎ 按钮
    │
    ▼
ChartBuilder 打开 (mode='edit', editingConfig=现有配置)
    │
    ├── 预填数据源、维度、指标、聚合、图表类型、标题
    └── 右侧显示当前配置的预览
    │
    ▼
用户修改配置
    │
    ▼
用户点击「更新」
    │
    ├── updateCard(config) → 替换 cards 中匹配 id 的配置
    ├── 卡片位置不变
    └── 关闭搭建器
```

### 7.4 保存/取消/恢复默认流程

```
enterEditMode()
    │
    ├── 深拷贝当前 cards → editingSnapshot
    └── isEditing = true

saveLayout()                cancelEdit()               resetToDefault()
    │                           │                           │
    ├── saveToStorage(cards)    ├── cards = editingSnapshot  ├── cards = DEFAULT_DASHBOARD
    ├── editingSnapshot = null  ├── editingSnapshot = null   ├── saveToStorage(DEFAULT_DASHBOARD)
    └── isEditing = false       └── isEditing = false        └── (保持编辑模式)
```

---

## 八、测试策略

### 8.1 单元测试（Vitest + React Testing Library）

| 测试目标 | 测试文件 | 用例数 | 关键测试点 |
|---------|---------|-------|-----------|
| `aggregate()` | `src/utils/__tests__/aggregation.test.ts` | 10+ | none/sum/avg/count/max 各方式、空数据、多字段 |
| `useDashboard` | `src/hooks/__tests__/useDashboard.test.ts` | 8+ | 初始化/增删改/持久化读写/容错/快照恢复 |
| `ChartCard` | `src/components/dashboard/__tests__/ChartCard.test.tsx` | 5+ | 数据渲染/图表类型切换/编辑删除按钮显示 |
| `DashboardToolbar` | `src/components/dashboard/__tests__/DashboardToolbar.test.tsx` | 4+ | 模式切换/按钮显示/回调触发 |
| `BarChart` | `src/components/charts/__tests__/BarChart.test.tsx` | 3+ | 渲染/色板/空数据 |

### 8.2 聚合函数测试用例示例

```typescript
describe('aggregate', () => {
  const equipmentData = [
    { lineName: 'A线-冲压', oee: 78.6 },
    { lineName: 'A线-冲压', oee: 72.3 },
    { lineName: 'B线-焊接', oee: 73.7 },
    { lineName: 'B线-焊接', oee: 81.1 },
  ];

  it('none: 直接透传', () => {
    const result = aggregate(equipmentData, 'lineName', ['oee'], 'none');
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ lineName: 'A线-冲压', oee: 78.6 });
  });

  it('avg: 分组求平均', () => {
    const result = aggregate(equipmentData, 'lineName', ['oee'], 'avg');
    expect(result).toHaveLength(2);
    expect(result.find(r => r.lineName === 'A线-冲压')?.oee).toBeCloseTo(75.45, 1);
    expect(result.find(r => r.lineName === 'B线-焊接')?.oee).toBeCloseTo(77.4, 1);
  });

  it('sum: 分组求和', () => {
    const result = aggregate(equipmentData, 'lineName', ['oee'], 'sum');
    expect(result.find(r => r.lineName === 'A线-冲压')?.oee).toBeCloseTo(150.9);
  });

  it('count: 分组计数', () => {
    const result = aggregate(equipmentData, 'lineName', ['oee'], 'count');
    expect(result.find(r => r.lineName === 'A线-冲压')?.oee).toBe(2);
  });

  it('max: 分组取最大', () => {
    const result = aggregate(equipmentData, 'lineName', ['oee'], 'max');
    expect(result.find(r => r.lineName === 'A线-冲压')?.oee).toBe(78.6);
  });

  it('空数据返回空数组', () => {
    expect(aggregate([], 'lineName', ['oee'], 'sum')).toEqual([]);
  });

  it('多个 valueFields', () => {
    const data = [
      { line: 'A', planned: 100, actual: 90 },
      { line: 'A', planned: 200, actual: 180 },
    ];
    const result = aggregate(data, 'line', ['planned', 'actual'], 'sum');
    expect(result[0]).toEqual({ line: 'A', planned: 300, actual: 270 });
  });
});
```

### 8.3 localStorage 容错测试用例

```typescript
describe('loadFromStorage 容错', () => {
  it('localStorage 不存在 → 返回默认', () => {
    localStorage.clear();
    expect(loadFromStorage()).toEqual(DEFAULT_DASHBOARD);
  });

  it('JSON 解析失败 → 返回默认', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json{{{');
    expect(loadFromStorage()).toEqual(DEFAULT_DASHBOARD);
  });

  it('version 不等于 3 → 返回默认', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, cards: [] }));
    expect(loadFromStorage()).toEqual(DEFAULT_DASHBOARD);
  });

  it('cards 不是数组 → 返回默认', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, cards: 'not-array' }));
    expect(loadFromStorage()).toEqual(DEFAULT_DASHBOARD);
  });

  it('正常数据 → 返回存储内容', () => {
    const stored = { version: 3, cards: [/* ... */] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    expect(loadFromStorage()).toEqual(stored.cards);
  });
});
```

**版本升级规则**：

以下任一情况发生时，必须将 LAYOUT_VERSION +1：
- `GRID_CONFIG` 中的 `rowHeight` 变更
- 默认卡片的 grid 位置/尺寸变更（DEFAULT_DASHBOARD）
- `CardConfig` 接口新增/删除/重命名字段
- 聚合方式枚举值变更

升级后，旧版本的 localStorage 数据自动失效，回退到 DEFAULT_DASHBOARD。

---

## 九、实施计划

### 9.1 开发阶段划分

| 阶段 | 任务 | 涉及文件 | 依赖 |
|------|------|---------|------|
| **P1: 基础设施** | 安装依赖、类型定义、常量定义、CSS 扩展 | `package.json`, `src/types/dashboard.ts`, `src/constants/dashboard.ts`, `src/index.css` | 无 |
| **P2: 后端 API** | 新增 datasource 路由 + 注册 | `server/src/routes/datasource.ts`, `server/src/index.ts` | 无 |
| **P3: 聚合函数** | 实现 aggregate + 单元测试 | `src/utils/aggregation.ts`, 测试文件 | 无 |
| **P4: 图表组件** | 实现 BarChart/LineChart/PieChart | `src/components/charts/*.tsx` | P1 (recharts) |
| **P5: 核心 Hook** | 实现 useDashboard + 单元测试 | `src/hooks/useDashboard.ts`, 测试文件 | P1 |
| **P6: 卡片组件** | 实现 ChartCard + API 对接 | `src/components/dashboard/ChartCard.tsx`, `src/api/index.ts` | P2, P3, P4 |
| **P7: 网格布局** | 实现 DashboardGrid + 工具栏 | `src/components/dashboard/DashboardGrid.tsx`, `DashboardToolbar.tsx` | P5, P6 |
| **P8: 搭建器** | 实现 ChartBuilder 全功能 | `src/components/dashboard/ChartBuilder.tsx` | P4, P6 |
| **P9: 页面集成** | 改造 Overview 页面 | `src/pages/Overview.tsx` | P7, P8 |
| **P10: 测试完善** | 补全所有组件测试 | `__tests__/*.tsx` | P9 |

P1/P2/P3 可并行开发，P4/P5 可并行，P6 依赖 P2~P4，后续顺序执行。

### 9.2 依赖安装命令

```bash
# 前端依赖
npm install recharts react-grid-layout
npm install -D @types/react-grid-layout
```

---

## 十、风险与决策记录

| 风险点 | 影响 | 应对策略 |
|-------|------|---------|
| react-grid-layout 与 React 19 兼容性 | 拖拽功能异常 | react-grid-layout ^1.5 已支持 React 18+，需验证 19 兼容；备选方案：@dnd-kit/core |
| 前端聚合大数据量性能 | 页面卡顿 | 当前 mock 数据量小（≤225 条），无风险；后续迁移后端聚合 |
| Recharts 在 Tailwind CSS 4 下的样式冲突 | 图表样式异常 | Recharts 使用内联 SVG 样式，与 Tailwind 无冲突 |
| localStorage 5MB 容量限制 | 看板配置丢失 | 单个配置远小于 5MB，不是风险 |
| 搭建器弹窗实现方式 | Sheet 不支持居中弹窗 | 使用 @base-ui/react 的 Dialog 组件（已是项目依赖），无需新增 |

---

## 十一、第三方库 API 验证清单

本项目使用的第三方库 API 均已在指定版本验证通过。开发者在实现前必须先运行验证命令确认 API 一致性。

### react-grid-layout@1.5.0

| API | 状态 | 说明 |
|-----|------|------|
| `GridLayout` | ✅ 可用 | 受控布局组件，layout prop 实时响应变化 |
| `useContainerWidth()` | ✅ 可用 | 返回 `{ width, containerRef, mounted, measureWidth }` |
| `ResponsiveGridLayout` | ⚠️ 不推荐 | 内部缓存 layout，动态增删卡片时不同步 |
| `WidthProvider` | ❌ 已移除 | 旧版 API，当前版本不存在 |

**关键差异**：
- `rowHeight`、`cols`、`margin`、`containerPadding` 必须通过 `gridConfig` 对象传入，不能作为独立 props
- `useContainerWidth()` 无参数调用，返回对象中包含 `containerRef`，需绑定到容器 DOM 元素

### recharts@2.15.0

| API | 状态 | 说明 |
|-----|------|------|
| `ResponsiveContainer` | ✅ 可用 | 支持 `width="100%" height="100%"` 或固定像素 |
| `BarChart/LineChart/PieChart` | ✅ 可用 | 标准图表组件 |
| `Legend` | ⚠️ 注意 | 渲染在 ResponsiveContainer 高度之外，需预留空间或使用 100% 高度自适应 |

---

## 十二、集成验证脚本

开发者完成任务后，必须运行以下自动化验证确认功能正常：

```bash
# 前置：npm install -g playwright && npx playwright install chromium
# 确保 dev server 已启动（npm run dev）

node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:5173/overview');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(3000);

  // 验证 1: 默认 3 个图表渲染
  const items = await page.locator('.react-grid-item').count();
  console.assert(items === 3, '❌ 应有 3 个默认图表，实际: ' + items);

  // 验证 2: 卡片高度合理（300-500px）
  const h = await page.locator('.react-grid-item').first().evaluate(el => el.offsetHeight);
  console.assert(h > 300 && h < 500, '❌ 卡片高度异常: ' + h);

  // 验证 3: 图表无溢出
  const overflow = await page.locator('.react-grid-item').first().evaluate(
    el => el.scrollHeight > el.clientHeight + 5);
  console.assert(!overflow, '❌ 图表内容溢出卡片');

  // 验证 4: 新建图表流程
  await page.click('text=编辑仪表盘');
  await page.click('text=新建图表');
  await page.waitForTimeout(2000);
  await page.click('text=添加到看板');
  await page.waitForTimeout(1000);
  const after = await page.locator('.react-grid-item').count();
  console.assert(after === 4, '❌ 添加后应有 4 个图表，实际: ' + after);

  console.log('✅ 全部验证通过');
  await browser.close();
})();
"
```

---

## 附录 A：需求功能 ↔ 技术实现追溯矩阵

| 需求功能 | 优先级 | 实现组件/模块 | 实现阶段 |
|---------|--------|-------------|---------|
| 选择数据源 | P0 | ChartBuilder → Tab 切换 | P8 |
| 勾选维度字段（X 轴） | P0 | ChartBuilder → 左侧面板单选 | P8 |
| 勾选指标字段（Y 轴，多选） | P0 | ChartBuilder → 左侧面板 Checkbox | P8 |
| 选择聚合方式 | P0 | ChartBuilder → Select 下拉 + aggregate() | P3, P8 |
| 选择图表类型 | P0 | ChartBuilder → 图表类型按钮组 | P8 |
| 实时预览 | P0 | ChartBuilder → 右侧 BarChart/LineChart/PieChart | P4, P8 |
| 自定义标题 | P0 | ChartBuilder → title input + autoTitle | P8 |
| 编辑已有图表 | P0 | ChartBuilder (mode='edit') + useDashboard.updateCard | P5, P8 |
| 拖拽移动卡片 | P0 | DashboardGrid → react-grid-layout isDraggable | P7 |
| 拖拽调整卡片大小 | P0 | DashboardGrid → react-grid-layout isResizable | P7 |
| 删除卡片 | P0 | ChartCard ✕ 按钮 → useDashboard.deleteCard | P5, P6 |
| 编辑/查看模式切换 | P0 | DashboardToolbar + useDashboard.isEditing | P5, P7 |
| 布局持久化（localStorage） | P0 | useDashboard → loadFromStorage/saveToStorage | P5 |
| 恢复默认看板 | P0 | useDashboard.resetToDefault → DEFAULT_DASHBOARD | P5 |
| 新增卡片置顶显示 | P1 | useDashboard.addCard → y=0 偏移 | P5 |
| 卡片内图表类型快速切换 | P1 | ChartCard → 头部按钮组 → updateCardChartType | P5, P6 |

## 附录 B：图表色板视觉参考

```
色号 1: ████ #1664FF  (主色/品牌蓝)
色号 2: ████ #14C9C9  (青绿)
色号 3: ████ #78D3F8  (浅蓝)
色号 4: ████ #9FDB1D  (黄绿)
色号 5: ████ #F7BA1E  (琥珀)
色号 6: ████ #722ED1  (紫色)
色号 7: ████ #F53F3F  (红色)
色号 8: ████ #FF7D00  (橙色)
```

多个 valueField 时，按色板顺序 1→2→3→...→8→1→... 循环分配。
