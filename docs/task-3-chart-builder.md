# Task 3：图表搭建器

| 字段 | 内容 |
|------|------|
| 来源文档 | `docs/task-breakdown.md` |
| 关联需求 | 生产概览页 - 自助式可视化仪表盘 |
| 关联技术文档 | `docs/technical-design.md` |
| 负责角色 | 前端开发 |
| 预计工时 | 2 天 |
| 前置依赖 | Task 1（类型/常量/API/图表组件/聚合函数） |
| 可并行 | 与 Task 2 并行开发 |

---

> **用户场景**：用户在编辑模式下点击「新建图表」，打开搭建器弹窗；选择数据源、维度、指标、聚合方式、图表类型后实时预览；确认后新图表出现在看板顶部。也可点击已有图表的 ✎ 按钮编辑配置。

## 交付物

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/dashboard/ChartBuilder.tsx` | 新增 | 图表搭建器全屏弹窗 |
| `src/pages/Overview.tsx` | 修改 | 集成 ChartBuilder（在 Task 2 基础上追加） |
| `src/components/dashboard/__tests__/ChartBuilder.test.tsx` | 新增 | 搭建器测试 |

## 实现要求

### 1. ChartBuilder 组件（`src/components/dashboard/ChartBuilder.tsx`）

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

### 2. Overview 页面集成 ChartBuilder

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

## 验收标准

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

## 附录：三个任务间的接口契约

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
