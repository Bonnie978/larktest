import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SimpleChart from './SimpleChart';
import { DataAggregator } from '@/utils/aggregator';
import { useDataSource } from '@/hooks/useDataSource';
import type { ChartConfig } from '@/types/dashboard';

interface ChartCardProps {
  config: ChartConfig;
  editable: boolean;
  onRemove?: () => void;
}

const aggregator = new DataAggregator();

export default function ChartCard({ config, editable, onRemove }: ChartCardProps) {
  const rawData = useDataSource(config.dataSource);

  const chartData = useMemo(() => {
    return aggregator.aggregate(rawData, config);
  }, [rawData, config]);

  return (
    <Card className="w-full h-full shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="pb-0 pt-3 px-4 flex-row items-center justify-between shrink-0">
        <CardTitle className="text-[13px] font-medium truncate">{config.title}</CardTitle>
        {editable && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
            title="删除图表"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-2 min-h-0">
        <SimpleChart data={chartData} chartType={config.chartType} />
      </CardContent>
    </Card>
  );
}
