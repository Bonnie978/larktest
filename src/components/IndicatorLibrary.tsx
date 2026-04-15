import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ChartType = 'table' | 'bar' | 'line' | 'pie';

interface IndicatorDef {
  id: string;
  name: string;
  category: '生产' | '质量' | '设备' | '工单';
  supportedChartTypes: ChartType[];
  defaultChartType: ChartType;
}

const INDICATOR_LIST: IndicatorDef[] = [
  {
    id: 'kpi-overview',
    name: 'KPI概览',
    category: '生产',
    supportedChartTypes: ['table'],
    defaultChartType: 'table',
  },
  {
    id: 'line-production',
    name: '产线产量完成情况',
    category: '生产',
    supportedChartTypes: ['table', 'bar', 'line'],
    defaultChartType: 'bar',
  },
  {
    id: 'weekly-defect-rate',
    name: '近7天不良率趋势',
    category: '质量',
    supportedChartTypes: ['table', 'line'],
    defaultChartType: 'line',
  },
  {
    id: 'defect-type-distribution',
    name: '不良类型分布',
    category: '质量',
    supportedChartTypes: ['table', 'pie', 'bar'],
    defaultChartType: 'pie',
  },
  {
    id: 'equipment-oee',
    name: '设备OEE排行',
    category: '设备',
    supportedChartTypes: ['table', 'bar'],
    defaultChartType: 'bar',
  },
  {
    id: 'order-status',
    name: '工单交付状态分布',
    category: '工单',
    supportedChartTypes: ['table', 'pie'],
    defaultChartType: 'pie',
  },
];

const CATEGORIES = ['生产', '质量', '设备', '工单'] as const;

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  table: '表格',
  bar: '柱状图',
  line: '折线图',
  pie: '饼图',
};

export interface IndicatorLibraryProps {
  open: boolean;
  onClose: () => void;
  onAddCard: (indicatorId: string, chartType: string) => void;
  existingIndicatorIds?: string[];
}

const IndicatorLibrary: React.FC<IndicatorLibraryProps> = ({
  open,
  onClose,
  onAddCard,
  existingIndicatorIds = [],
}) => {
  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: INDICATOR_LIST.filter((ind) => ind.category === cat),
  }));

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>指标库</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-4">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="flex flex-col gap-2">
                {items.map((indicator) => {
                  const isAdded = existingIndicatorIds.includes(indicator.id);
                  return (
                    <div
                      key={indicator.id}
                      className="flex items-center justify-between gap-2 rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {indicator.name}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {indicator.supportedChartTypes.map((ct) => (
                            <Badge
                              key={ct}
                              variant="secondary"
                              className="text-xs"
                            >
                              {CHART_TYPE_LABELS[ct]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {isAdded ? (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          已添加
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onAddCard(indicator.id, indicator.defaultChartType)
                          }
                        >
                          添加
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default IndicatorLibrary;
