import { useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import ChartCard from '@/components/dashboard/ChartCard';
import type { ChartConfig } from '@/types/dashboard';
import type { Layout, LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import '@/grid-layout.css';

interface DashboardGridProps {
  charts: ChartConfig[];
  layout: LayoutItem[];
  isEditMode: boolean;
  onLayoutChange: (layout: LayoutItem[]) => void;
  onDeleteChart: (chartId: string) => void;
}

/**
 * DashboardGrid Component
 * 
 * 基于 react-grid-layout 实现的拖拽式看板网格布局组件
 * 
 * 功能特性：
 * - 12 列网格布局
 * - 卡片拖拽移动和调整大小
 * - 编辑模式切换（查看/编辑）
 * - 卡片删除操作
 * - 每个卡片内嵌 ChartCard 使用 recharts 渲染图表
 * - 编辑模式下显示拖拽手柄和删除按钮
 * 
 * @param charts - 图表配置列表
 * @param layout - 布局配置列表
 * @param isEditMode - 是否处于编辑模式
 * @param onLayoutChange - 布局变化回调
 * @param onDeleteChart - 删除图表回调
 */
export default function DashboardGrid({
  charts,
  layout,
  isEditMode,
  onLayoutChange,
  onDeleteChart,
}: DashboardGridProps) {
  // 处理布局变化
  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      if (!isEditMode) return;
      
      // Convert readonly Layout to mutable LayoutItem[]
      const updatedLayout: LayoutItem[] = Array.from(newLayout).map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      }));
      
      onLayoutChange(updatedLayout);
    },
    [isEditMode, onLayoutChange]
  );

  return (
    <GridLayout
      className="layout"
      layout={layout}
      width={1200}
      gridConfig={{
        cols: 12,
        rowHeight: 80,
        margin: [16, 16],
      }}
      dragConfig={{
        enabled: isEditMode,
        handle: '.drag-handle',
      }}
      resizeConfig={{
        enabled: isEditMode,
      }}
      onLayoutChange={handleLayoutChange}
    >
      {charts.map((chart) => (
        <div key={chart.id} className="chart-card">
          {isEditMode && (
            <div className="drag-handle absolute top-2 left-2 cursor-move p-1 rounded hover:bg-gray-100 z-10">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>
          )}
          <ChartCard
            config={chart}
            editable={isEditMode}
            onRemove={() => onDeleteChart(chart.id)}
          />
        </div>
      ))}
    </GridLayout>
  );
}
