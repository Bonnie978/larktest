import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { aggregate } from '@/lib/aggregationEngine';
import { DATA_SOURCES } from '@/config/dataSources';
import { getDataSourceData } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import type { CardConfig, ChartType, Aggregation } from '@/types/dashboard';

const COLORS = ['#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D', '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00'];

interface ChartBuilderProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: CardConfig) => void;
  editingCard?: CardConfig;
}

const AGGREGATION_OPTIONS: { value: Aggregation; label: string }[] = [
  { value: 'none', label: '无聚合' },
  { value: 'sum', label: '求和' },
  { value: 'avg', label: '平均' },
  { value: 'count', label: '计数' },
  { value: 'max', label: '最大值' },
];

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
];

export function ChartBuilder({ open, onClose, onConfirm, editingCard }: ChartBuilderProps) {
  const [step, setStep] = useState(1);
  const [dataSourceId, setDataSourceId] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [groupByField, setGroupByField] = useState('');
  const [aggregation, setAggregation] = useState<Aggregation>('none');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('');

  // 编辑模式初始化
  useEffect(() => {
    if (editingCard && open) {
      setDataSourceId(editingCard.dataSourceId);
      setSelectedFields([
        editingCard.groupByField,
        ...editingCard.valueFields,
      ]);
      setGroupByField(editingCard.groupByField);
      setAggregation(editingCard.aggregation);
      setChartType(editingCard.chartType);
      setTitle(editingCard.title);
      setStep(1);
    }
  }, [editingCard, open]);

  // 重置 state
  const resetState = () => {
    setStep(1);
    setDataSourceId('');
    setSelectedFields([]);
    setGroupByField('');
    setAggregation('none');
    setChartType('bar');
    setTitle('');
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  // 当前数据源
  const currentSource = useMemo(
    () => DATA_SOURCES.find((ds) => ds.id === dataSourceId),
    [dataSourceId],
  );

  // 字段分组
  const stringFields = useMemo(
    () => currentSource?.fields.filter((f) => f.type === 'string') ?? [],
    [currentSource],
  );
  const numberFields = useMemo(
    () => currentSource?.fields.filter((f) => f.type === 'number') ?? [],
    [currentSource],
  );

  // 已选中的 string / number 字段
  const selectedStringFields = useMemo(
    () => stringFields.filter((f) => selectedFields.includes(f.key)),
    [stringFields, selectedFields],
  );
  const valueFields = useMemo(
    () => numberFields.filter((f) => selectedFields.includes(f.key)).map((f) => f.key),
    [numberFields, selectedFields],
  );

  // Step 3: 获取数据
  const { data: rawData } = useRequest(
    () => getDataSourceData(dataSourceId),
    [dataSourceId],
  );

  // 聚合后的预览数据
  const previewData = useMemo(() => {
    if (!rawData || !groupByField || valueFields.length === 0) return [];
    return aggregate({
      data: rawData,
      groupByField,
      valueFields,
      aggregation,
    });
  }, [rawData, groupByField, valueFields, aggregation]);

  // 自动生成标题
  const autoTitle = useMemo(() => {
    if (!groupByField || valueFields.length === 0) return '';
    const groupLabel =
      currentSource?.fields.find((f) => f.key === groupByField)?.label ?? groupByField;
    const valueLabels = valueFields.map(
      (vf) => currentSource?.fields.find((f) => f.key === vf)?.label ?? vf,
    );
    return `按${groupLabel}的${valueLabels.join('/')}`;
  }, [groupByField, valueFields, currentSource]);

  const handleConfirm = () => {
    const config: CardConfig = {
      id: editingCard?.id || Date.now().toString(),
      title: title || autoTitle,
      dataSourceId,
      chartType,
      groupByField,
      valueFields,
      aggregation,
    };
    onConfirm(config);
    onClose();
    resetState();
  };

  const toggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // ======== Render ========

  const renderStep1 = () => (
    <div className="grid grid-cols-2 gap-3">
      {DATA_SOURCES.map((ds) => (
        <button
          key={ds.id}
          type="button"
          className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
            dataSourceId === ds.id ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onClick={() => {
            setDataSourceId(ds.id);
            // 切换数据源时清空字段选择
            if (ds.id !== dataSourceId) {
              setSelectedFields([]);
              setGroupByField('');
            }
          }}
        >
          <span className="text-2xl">{ds.icon}</span>
          <span className="text-sm font-medium">{ds.name}</span>
          <span className="text-xs text-muted-foreground">{ds.fields.length} 个字段</span>
        </button>
      ))}
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-2 gap-6">
      {/* 左侧：字段选择 */}
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">文本字段</h4>
          <div className="space-y-2">
            {stringFields.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <Checkbox
                  id={`field-${f.key}`}
                  checked={selectedFields.includes(f.key)}
                  onCheckedChange={() => toggleField(f.key)}
                />
                <Label htmlFor={`field-${f.key}`} className="text-sm cursor-pointer">
                  {f.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">数值字段</h4>
          <div className="space-y-2">
            {numberFields.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <Checkbox
                  id={`field-${f.key}`}
                  checked={selectedFields.includes(f.key)}
                  onCheckedChange={() => toggleField(f.key)}
                />
                <Label htmlFor={`field-${f.key}`} className="text-sm cursor-pointer">
                  {f.label}
                  {f.description && (
                    <span className="ml-1 text-xs text-muted-foreground">({f.description})</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧：分组维度和聚合方式 */}
      <div className="space-y-4">
        <div>
          <Label className="mb-1.5 block text-sm font-medium">分组维度</Label>
          <select
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={groupByField}
            onChange={(e) => setGroupByField(e.target.value)}
          >
            <option value="">请选择</option>
            {selectedStringFields.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="mb-1.5 block text-sm font-medium">聚合方式</Label>
          <select
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as Aggregation)}
          >
            {AGGREGATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderPreviewChart = () => {
    if (previewData.length === 0) {
      return (
        <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
          请完成配置以预览图表
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={previewData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={groupByField} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {valueFields.map((vf, i) => (
              <Bar key={vf} dataKey={vf} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={previewData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={groupByField} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {valueFields.map((vf, i) => (
              <Line
                key={vf}
                type="monotone"
                dataKey={vf}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      // 饼图只取第一个 valueField
      const vf = valueFields[0];
      return (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={previewData}
              dataKey={vf}
              nameKey={groupByField}
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {previewData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  const renderStep3 = () => (
    <div className="space-y-4">
      {/* 图表类型选择 */}
      <div>
        <Label className="mb-1.5 block text-sm font-medium">图表类型</Label>
        <div className="flex gap-2">
          {CHART_TYPE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={chartType === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 标题输入 */}
      <div>
        <Label className="mb-1.5 block text-sm font-medium">标题</Label>
        <Input
          placeholder={autoTitle || '请输入图表标题'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 预览 */}
      <div className="rounded-lg border p-3">
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">预览</h4>
        {renderPreviewChart()}
      </div>
    </div>
  );

  const stepTitles = ['选择数据源', '配置字段', '图表类型与预览'];

  const canNext1 = !!dataSourceId;
  const canNext2 = selectedFields.length > 0 && !!groupByField && valueFields.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingCard ? '编辑图表' : '新建图表'} - 步骤 {step}/3: {stepTitles[step - 1]}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[320px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                  上一步
                </Button>
              )}
            </div>
            <div>
              {step === 1 && (
                <Button disabled={!canNext1} onClick={() => setStep(2)}>
                  下一步
                </Button>
              )}
              {step === 2 && (
                <Button disabled={!canNext2} onClick={() => setStep(3)}>
                  下一步
                </Button>
              )}
              {step === 3 && (
                <Button onClick={handleConfirm}>
                  {editingCard ? '更新' : '添加到看板'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
