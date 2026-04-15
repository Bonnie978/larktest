# Task 2：看板编辑

| 字段 | 内容 |
|------|------|
| 来源文档 | `docs/task-breakdown.md` |
| 关联需求 | 生产概览页 - 自助式可视化仪表盘 |
| 关联技术文档 | `docs/technical-design.md` |
| 负责角色 | 前端开发 |
| 预计工时 | 2 天 |
| 前置依赖 | Task 1（类型/常量/ChartCard） |
| 可并行 | 与 Task 3 并行开发 |

---

> **用户场景**：用户点击「编辑仪表盘」进入编辑模式，可拖拽移动/缩放图表卡片，可删除卡片，点击「保存」持久化布局，点击「取消」恢复，点击「恢复默认」回到预设看板。刷新页面后布局保持。

## 交付物

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/hooks/useDashboard.ts` | 新增 | 仪表盘核心状态管理 Hook |
| `src/components/dashboard/DashboardGrid.tsx` | 新增 | react-grid-layout 拖拽网格容器 |
| `src/components/dashboard/DashboardToolbar.tsx` | 新增 | 编辑/查看模式工具栏 |
| `src/components/dashboard/index.ts` | 新增 | 统一导出 |
| `src/pages/Overview.tsx` | 修改 | 集成 DashboardGrid + DashboardToolbar + 移除固定表格 |
| `src/hooks/__tests__/useDashboard.test.ts` | 新增 | Hook 单元测试 |
| `src/components/dashboard/__tests__/DashboardToolbar.test.tsx` | 新增 | Toolbar 测试 |

## 实现要求

### 1. useDashboard Hook（`src/hooks/useDashboard.ts`）

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

### 2. DashboardGrid（`src/components/dashboard/DashboardGrid.tsx`）

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

### 3. DashboardToolbar（`src/components/dashboard/DashboardToolbar.tsx`）

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

### 4. Overview 页面改造（`src/pages/Overview.tsx`）

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

## 验收标准

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
