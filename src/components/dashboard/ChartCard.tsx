import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SimpleChart from './SimpleChart';
import { DataAggregator } from '@/utils/aggregator';
import { useDataSource } from '@/hooks/useDataSource';
import type { ChartConfig } from '@/types/dashboard';

interface ChartCardProps {
  config: ChartConfig;
  editable: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
}

const aggregator = new DataAggregator();

export default function ChartCard({ config, editable, onEdit, onRemove }: ChartCardProps) {
  const rawData = useDataSource(config.dataSource);

  const chartData = useMemo(() => {
    return aggregator.aggregate(rawData, config);
  }, [rawData, config]);

  return (
    <Card className="w-full h-full shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="pb-0 pt-3 px-4 flex-row items-center justify-between shrink-0">
        <CardTitle className="text-[13px] font-medium truncate">{config.title}</CardTitle>
        {editable && (
          <div className="no-drag flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="编辑图表"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="删除图表"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-2 min-h-0">
        <SimpleChart data={chartData} chartType={config.chartType} />
      </CardContent>
    </Card>
  );
}
