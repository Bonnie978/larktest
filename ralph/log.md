# Ralph Agent Log

## Project: 智造云 · 自助式可视化仪表盘 v2

### v2 重构说明
- 旧的 v1 stories（dashboard-visualization/chart-switch/drag-layout 等）已删除
- 旧组件（DashboardEngine, IndicatorLibrary, indicators.ts, useDashboardLayout）将在 v2 完成后删除
- v2 目标：用户自助搭建指标（选数据源→选字段→选聚合→选图表类型→生成卡片）
- 拖拽方案从 react-grid-layout 切换到 gridstack.js

### Setup
- 实现计划: `docs/plans/2026-04-15-dashboard-builder.md`
- PRD: GitHub Issue #4
- User stories: 3 个文件，10 个 stories，0 passing
  - `dashboard-v2-foundation.json` (4 stories): 类型、聚合引擎、后端API、前端API
  - `dashboard-v2-components.json` (3 stories): GridStack、状态管理hook、卡片渲染器
  - `dashboard-v2-builder.json` (3 stories): ChartBuilder、Overview集成、清理
- 依赖顺序: foundation → components → builder
- foundation 的 4 个 story 完成后，components 的 3 个可并行
- Next agent: 从 dashboard-v2-foundation.json 第一个 story 开始

### 2026-04-15 Story 1: 类型定义和数据源注册表
- 创建 `src/types/dashboard.ts`: ChartType, Aggregation, FieldMeta, DataSourceMeta, CardConfig, GridPosition, DashboardCard, DashboardLayout
- 创建 `src/config/dataSources.ts`: 5 个数据源注册（line-production, equipment, quality, orders, weekly-defects）+ getDataSourceMeta 查询函数
- `npx tsc --noEmit` 编译通过，无错误
- dashboard-v2-foundation.json story 1 passes: true
- Status: 10 stories, 1 passing

### 2026-04-15 Story 2: 前端聚合引擎（纯函数 + 测试）
- 创建 `src/lib/aggregationEngine.ts`: 导出 aggregate 函数，支持 sum/avg/count/max/none 五种聚合方式
- 创建 `src/lib/__tests__/aggregationEngine.test.ts`: 8 个测试用例覆盖所有聚合类型、多 valueFields、空数组、单条数据
- 使用 `@/types/dashboard` 中的 Aggregation 类型（Task 1 已创建）
- `npx vitest run` 8 个测试全部通过
- dashboard-v2-foundation.json story 2 passes: true
- Status: 10 stories, 2 passing

### 2026-04-15 Story 3: 后端通用数据源查询 API
- 创建 `server/src/routes/datasource.ts`: GET /api/datasource 返回 5 个数据源元数据，GET /api/datasource/:id/data 返回原始数据（支持 fields 字段投影 + 等值筛选）
- 修改 `server/src/index.ts`: 注册 datasourceRouter 到 /api/datasource
- curl 验证：元数据返回 5 个数据源，字段投影 (fields=name,oee) 正确返回 2 个字段
- dashboard-v2-foundation.json story 3 (index 2) passes: true
- Status: 10 stories, 3 passing

### 2026-04-15 Story 4: 前端 API 新增 getDataSources 和 getDataSourceData
- 修改 `src/api/index.ts`: 添加 getDataSources() 和 getDataSourceData(id, params?) 函数
- getDataSources 返回类型用 any[] 占位（@/types/dashboard 中的 DataSourceMeta 由另一 agent 创建，已存在则后续可替换）
- `npx tsc --noEmit` 编译通过，无错误
- dashboard-v2-foundation.json story 4 (index 3) passes: true
- Status: 10 stories, 4 passing
- foundation 全部 4 个 stories 完成，components 阶段可以开始

### 2026-04-15 Story 5 (components index 0): 安装 gridstack.js 并创建 DashboardGridStack 组件
- 运行 `npm install gridstack` 安装 gridstack.js
- 创建 `src/components/DashboardGridStack.tsx`: 基于 GridStack.init 初始化 12 列网格（cellHeight 80, margin 12）
  - Props: items / isEditing / onLayoutChange / onDeleteCard / onEditCard / renderCard
  - 编辑模式 enableMove(true) + enableResize(true)，卡片显示编辑和删除按钮
  - 查看模式 enableMove(false) + enableResize(false)
  - 监听 gridstack change 事件同步布局到 React state
- `npx tsc --noEmit` 编译通过，无错误
- dashboard-v2-components.json story 0 passes: true
- Status: 10 stories, 5 passing

### 2026-04-15 Story 6 (components index 1): 看板状态管理 hook（useDashboardStore + 测试）
- 创建 `src/hooks/__tests__/useDashboardStore.test.ts`: 5 个测试覆盖空 localStorage 返回默认、加载已保存、损坏数据 fallback、错误版本 fallback、save 写入
- 创建 `src/hooks/useDashboardStore.ts`: 导出 loadDashboard / saveDashboard 纯函数、DEFAULT_CARDS（3 个预设卡片）和 useDashboardStore hook
  - localStorage 键 `dashboard-v2`，版本号 version: 2
  - hook 提供: cards, isEditing, startEditing, save, cancel, addCard, updateCard, deleteCard, updateLayout, resetToDefault
- `npx vitest run src/hooks/__tests__/useDashboardStore.test.ts` 5 个测试全部通过
- dashboard-v2-components.json story 1 passes: true
- Status: 10 stories, 6 passing

### 2026-04-15 Story 7 (components index 2): 看板卡片渲染器 DashboardCardRenderer
- 创建 `src/components/DashboardCardRenderer.tsx`: 根据 CardConfig 独立获取数据→聚合→渲染 Recharts 图表
- Props: config(CardConfig) + onChartTypeChange(ChartType)
- 使用 useRequest + getDataSourceData 获取原始数据，aggregate() 聚合后渲染
- 支持 bar/line/pie 三种图表类型切换，图表高度 280px
- 火山引擎色板 8 色，饼图带百分比内标签
- `npx tsc --noEmit` 编译通过，无错误
- dashboard-v2-components.json story 2 passes: true
- Status: 10 stories, 7 passing

### 2026-04-15 Story 8 (builder index 0): 指标搭建器 ChartBuilder 向导弹窗
- 安装 shadcn 组件: dialog, checkbox, label, input (`npx shadcn@latest add dialog checkbox label input -y`)
- 创建 `src/components/ChartBuilder.tsx`: 3 步向导弹窗
  - Props: open, onClose, onConfirm(config), editingCard?(编辑模式)
  - Step 1: 从 DATA_SOURCES 渲染 5 个数据源卡片(grid-cols-2)，点击选中高亮(border-primary bg-primary/5)
  - Step 2: 左侧字段 checkbox 列表(string/number 分组)，右侧分组维度下拉+聚合方式下拉(HTML select)
  - Step 3: 图表类型按钮组(bar/line/pie) + 标题输入(Input) + 实时预览(useRequest 获取数据 → aggregate → Recharts 渲染)
  - 编辑模式: editingCard 传入时预填所有 state，确认按钮文案改为「更新」
  - 确认逻辑: 组装 CardConfig，调用 onConfirm + onClose + resetState
- `npx tsc --noEmit` 编译通过，无错误
- `npx vite build` 构建成功
- dashboard-v2-builder.json story 0 passes: true
- Status: 10 stories, 8 passing

### 2026-04-15 Story 9 (builder index 1): Overview 页面集成看板+搭建器
- 重写 `src/pages/Overview.tsx`:
  - 保留 KPI 卡片行（5 个 KPICard）和状态汇总栏（4 个 Card）不变
  - 删除所有旧的 ChartCard 引用和 indicators 引用
  - 图表区域替换为 DashboardGridStack + DashboardCardRenderer
  - 集成 useDashboardStore 管理 cards/isEditing/addCard/updateCard/deleteCard/updateLayout/resetToDefault
  - DashboardToolbar 放置在标题行右侧，「新建图表」按钮打开 ChartBuilder
  - ChartBuilder 确认后通过 addCard/updateCard 写入看板
  - 编辑模式下卡片编辑按钮打开 ChartBuilder（editingCard 模式）
- `npx tsc --noEmit` 编译通过，无错误
- `npx vite build` 构建成功
- dashboard-v2-builder.json story 1 passes: true
- Status: 10 stories, 9 passing

### 2026-04-15 Story 10 (builder index 2): 清理旧文件 + 全部测试通过
- 删除 `src/components/DashboardEngine.tsx`
- 删除 `src/components/IndicatorLibrary.tsx`
- 删除 `src/components/indicators.ts`
- 删除 `src/hooks/useDashboardLayout.ts`
- 修复 `src/components/ChartCard.tsx` 残留 import: `./indicators` → `@/types/dashboard`
- `npx tsc --noEmit` 编译通过，无错误
- `npx vite build` 构建成功
- `npx vitest run` 7 个测试文件，33 个测试全部通过
- dashboard-v2-builder.json story 2 passes: true
- Status: 10 stories, 10 passing (ALL DONE)
