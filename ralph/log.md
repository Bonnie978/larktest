# Ralph Agent Log

## Project: 智造云 · 生产运营管理平台 — 可视化仪表盘迭代

### Iteration 0 — Setup (Manual)
- Created user stories in `docs/user-stories/`:
  - `dashboard-visualization.json` (3 stories): 柱状图、折线图、饼图
  - `dashboard-chart-switch.json` (2 stories): 图表类型切换
  - `dashboard-drag-layout.json` (3 stories): 拖拽布局 + 编辑模式
  - `dashboard-indicator-library.json` (3 stories): 指标库 + 添加/删除卡片
  - `dashboard-persistence.json` (3 stories): localStorage 持久化
- Total: 14 stories, 0 passing
- Dependencies: visualization → chart-switch → drag-layout → indicator-library → persistence
- Next agent should start with `dashboard-visualization.json` stories

### Iteration — Dashboard Drag Layout
- Implemented `src/components/DashboardEngine.tsx`: 基于 react-grid-layout 的仪表盘引擎组件，支持 12 列响应式网格、拖拽排列、调整大小、编辑/查看模式切换、卡片删除
- Implemented `src/components/DashboardToolbar.tsx`: 仪表盘工具栏组件，编辑模式显示添加卡片/恢复默认/取消/保存按钮，查看模式显示编辑仪表盘按钮
- Updated `docs/user-stories/dashboard-drag-layout.json`: 3 stories all passing

### Iteration — 可视化图表 + 图表类型切换
- Created `src/components/ChartCard.tsx`: 通用图表卡片组件，支持 table/bar/line/pie 四种图表类型切换
- Created `src/components/indicators.ts`: 指标库定义，包含 6 个指标（line-production, weekly-defect-rate, defect-type-distribution, equipment-oee, order-status, kpi-overview）
- Updated `src/pages/Overview.tsx`: 将产线产量和不良数据汇总的纯表格替换为 ChartCard（柱状图/折线图），新增不良类型分布饼图
- 使用 Recharts (BarChart, LineChart, PieChart) + ResponsiveContainer
- 图表样式：火山引擎色板、CartesianGrid、Tooltip 白底边框、Legend 底部、饼图百分比标签
- 每个 ChartCard 通过 supportedTypes 限制可切换类型，按钮组高亮当前选中
- TypeScript 编译通过，零错误
- Stories passed: `dashboard-visualization.json` (3/3), `dashboard-chart-switch.json` (2/2)

### Iteration — Indicator Library & Layout Persistence
- Created `src/components/IndicatorLibrary.tsx`: 指标库侧边栏组件，使用 shadcn Sheet 从右侧滑出，按分类（生产/质量/设备/工单）分组展示 6 个指标，每个指标显示名称、支持的图表类型 Badge、添加按钮，已添加指标显示"已添加"标签
- Created `src/hooks/useDashboardLayout.ts`: 仪表盘布局管理 hook，封装 cards 状态管理、编辑模式、localStorage 持久化（key: dashboard-layout-v1）、添加/删除/切换图表类型、保存/取消/恢复默认布局；localStorage 解析失败自动 fallback 到默认布局
- Updated `docs/user-stories/dashboard-indicator-library.json`: 3 stories all passing
- Updated `docs/user-stories/dashboard-persistence.json`: 3 stories all passing
