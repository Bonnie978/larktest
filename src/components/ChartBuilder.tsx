import React, { useState, useEffect } from "react";
import Drawer from "./Drawer";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ChartConfig, DataSourceType, AggregationType, ChartType } from "@/types/chart";

interface ChartBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: ChartConfig) => void;
  initialConfig?: ChartConfig;
  mode?: 'create' | 'edit';
}

const dataSourceOptions: { label: string; value: DataSourceType }[] = [
  { label: "产线数据", value: "production" },
  { label: "设备数据", value: "equipment" },
  { label: "质量数据", value: "quality" },
  { label: "工单数据", value: "order" },
  { label: "班次数据", value: "shift" },
];

const aggregationOptions: { label: string; value: AggregationType }[] = [
  { label: "求和", value: "sum" },
  { label: "平均值", value: "avg" },
  { label: "计数", value: "count" },
  { label: "最大值", value: "max" },
  { label: "最小值", value: "min" },
];

const chartTypeOptions: { label: string; value: ChartType }[] = [
  { label: "柱状图", value: "bar" },
  { label: "折线图", value: "line" },
  { label: "饼图", value: "pie" },
  { label: "面积图", value: "area" },
];

const dimensionFieldsBySource: Record<DataSourceType, { label: string; value: string }[]> = {
  production: [
    { label: "产线名称", value: "lineName" },
    { label: "班次", value: "shift" },
    { label: "车间", value: "workshop" },
  ],
  equipment: [
    { label: "设备名称", value: "name" },
    { label: "设备类型", value: "type" },
    { label: "所属产线", value: "lineName" },
    { label: "状态", value: "status" },
  ],
  quality: [
    { label: "产线名称", value: "lineName" },
    { label: "缺陷类型", value: "defectType" },
    { label: "检验员", value: "inspector" },
    { label: "状态", value: "status" },
  ],
  order: [
    { label: "产品型号", value: "productModel" },
    { label: "客户", value: "customer" },
    { label: "交付状态", value: "deliveryStatus" },
  ],
  shift: [
    { label: "班次", value: "shift" },
    { label: "产线", value: "lineName" },
  ],
};

const metricFieldsBySource: Record<DataSourceType, { label: string; value: string }[]> = {
  production: [
    { label: "计划产量", value: "planned" },
    { label: "实际产量", value: "actual" },
    { label: "完成率", value: "completionRate" },
  ],
  equipment: [
    { label: "可用率", value: "availability" },
    { label: "性能率", value: "performance" },
    { label: "质量率", value: "quality" },
    { label: "OEE", value: "oee" },
  ],
  quality: [
    { label: "检验数量", value: "inspectedQty" },
    { label: "缺陷数量", value: "defectQty" },
    { label: "缺陷率", value: "defectRate" },
  ],
  order: [
    { label: "计划数量", value: "plannedQty" },
    { label: "完成数量", value: "completedQty" },
  ],
  shift: [
    { label: "计划产量", value: "planned" },
    { label: "实际产量", value: "actual" },
  ],
};

const ChartBuilder: React.FC<ChartBuilderProps> = ({
  open,
  onClose,
  onSave,
  initialConfig,
  mode = 'create',
}) => {
  const [title, setTitle] = useState("");
  const [dataSource, setDataSource] = useState<DataSourceType>("production");
  const [dimension, setDimension] = useState("");
  const [metric, setMetric] = useState("");
  const [aggregation, setAggregation] = useState<AggregationType>("sum");
  const [chartType, setChartType] = useState<ChartType>("bar");

  useEffect(() => {
    if (initialConfig && mode === 'edit') {
      setTitle(initialConfig.title);
      setDataSource(initialConfig.dataSource);
      setDimension(initialConfig.dimension);
      setMetric(initialConfig.metric);
      setAggregation(initialConfig.aggregation);
      setChartType(initialConfig.chartType);
    } else {
      setTitle("");
      setDataSource("production");
      setDimension("");
      setMetric("");
      setAggregation("sum");
      setChartType("bar");
    }
  }, [initialConfig, mode, open]);

  const handleDataSourceChange = (value: string | null) => {
    if (!value) return;
    setDataSource(value as DataSourceType);
    setDimension("");
    setMetric("");
  };

  const handleSave = () => {
    const config: ChartConfig = {
      id: initialConfig?.id || `chart-${Date.now()}`,
      title,
      dataSource,
      dimension,
      metric,
      aggregation,
      chartType,
      layout: initialConfig?.layout || { x: 0, y: 0, w: 6, h: 4 },
    };
    onSave(config);
    onClose();
  };

  const isValid = title && dataSource && dimension && metric && aggregation && chartType;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? "编辑图表" : "新建图表"}
      width="520px"
    >
      <div className="space-y-6 pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">图表标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入图表标题"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">数据源</label>
          <ShadcnSelect value={dataSource} onValueChange={handleDataSourceChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dataSourceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">维度字段</label>
          <ShadcnSelect value={dimension} onValueChange={(v) => v && setDimension(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择维度字段" />
            </SelectTrigger>
            <SelectContent>
              {dimensionFieldsBySource[dataSource].map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">指标字段</label>
          <ShadcnSelect value={metric} onValueChange={(v) => v && setMetric(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择指标字段" />
            </SelectTrigger>
            <SelectContent>
              {metricFieldsBySource[dataSource].map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">聚合方式</label>
          <ShadcnSelect value={aggregation} onValueChange={(v) => v && setAggregation(v as AggregationType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aggregationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">图表类型</label>
          <ShadcnSelect value={chartType} onValueChange={(v) => v && setChartType(v as ChartType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            保存
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default ChartBuilder;
