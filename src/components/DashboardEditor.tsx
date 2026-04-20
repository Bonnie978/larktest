import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import DashboardGrid from '@/components/DashboardGrid';
import type { ChartConfig } from '@/types/dashboard';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardConfig {
  version: number;
  charts: ChartConfig[];
  layout: LayoutItem[];
}

const getDefaultCharts = (): ChartConfig[] => [
  {
    id: 'default-1',
    title: '产线产量完成情况',
    dataSource: 'line-production',
    chartType: 'bar',
    dimension: 'lineName',
    metrics: ['planned', 'actual'],
    aggregation: 'sum',
    layout: { x: 0, y: 0, w: 6, h: 4 },
  },
  {
    id: 'default-2',
    title: '近7天不良率趋势',
    dataSource: 'line-production',
    chartType: 'line',
    dimension: 'date',
    metrics: ['defectRate'],
    aggregation: 'sum',
    layout: { x: 6, y: 0, w: 6, h: 4 },
  },
  {
    id: 'default-3',
    title: '不良类型分布',
    dataSource: 'quality-defects',
    chartType: 'pie',
    dimension: 'defectType',
    metrics: ['defectCount'],
    aggregation: 'sum',
    layout: { x: 0, y: 4, w: 6, h: 4 },
  },
];

const STORAGE_KEY = 'dashboard-grid-v1';

const loadDashboard = (): DashboardConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const defaultCharts = getDefaultCharts();
      return {
        version: 1,
        charts: defaultCharts,
        layout: defaultCharts.map(c => ({
          i: c.id,
          x: c.layout.x,
          y: c.layout.y,
          w: c.layout.w,
          h: c.layout.h,
        })),
      };
    }
    const config: DashboardConfig = JSON.parse(saved);
    if (config.version !== 1 || !Array.isArray(config.charts)) {
      const defaultCharts = getDefaultCharts();
      return {
        version: 1,
        charts: defaultCharts,
        layout: defaultCharts.map(c => ({
          i: c.id,
          x: c.layout.x,
          y: c.layout.y,
          w: c.layout.w,
          h: c.layout.h,
        })),
      };
    }
    return config;
  } catch {
    const defaultCharts = getDefaultCharts();
    return {
      version: 1,
      charts: defaultCharts,
      layout: defaultCharts.map(c => ({
        i: c.id,
        x: c.layout.x,
        y: c.layout.y,
        w: c.layout.w,
        h: c.layout.h,
      })),
    };
  }
};

const saveDashboard = (config: DashboardConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export default function DashboardEditor() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>(() => loadDashboard());
  const [tempConfig, setTempConfig] = useState<DashboardConfig>(() => loadDashboard());

  useEffect(() => {
    const loaded = loadDashboard();
    setConfig(loaded);
    setTempConfig(loaded);
  }, []);

  const handleToggleEditMode = () => {
    if (isEditMode) {
      setTempConfig(config);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = () => {
    setConfig(tempConfig);
    saveDashboard(tempConfig);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsEditMode(false);
  };

  const handleResetDefault = () => {
    const defaultCharts = getDefaultCharts();
    setTempConfig({
      version: 1,
      charts: defaultCharts,
      layout: defaultCharts.map(c => ({
        i: c.id,
        x: c.layout.x,
        y: c.layout.y,
        w: c.layout.w,
        h: c.layout.h,
      })),
    });
  };

  const handleAddCard = () => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      title: '新建图表',
      dataSource: 'line-production',
      chartType: 'bar',
      dimension: 'lineName',
      metrics: ['planned'],
      aggregation: 'sum',
      layout: { x: 0, y: 0, w: 6, h: 4 },
    };
    
    const newLayout: LayoutItem = {
      i: newChart.id,
      x: 0,
      y: 0,
      w: 6,
      h: 4,
    };

    // Shift existing cards down
    const shiftedLayout = tempConfig.layout.map(item => ({
      ...item,
      y: item.y + 4,
    }));

    setTempConfig({
      ...tempConfig,
      charts: [newChart, ...tempConfig.charts],
      layout: [newLayout, ...shiftedLayout],
    });
  };

  const handleDeleteChart = (id: string) => {
    setTempConfig({
      ...tempConfig,
      charts: tempConfig.charts.filter(c => c.id !== id),
      layout: tempConfig.layout.filter(l => l.i !== id),
    });
  };

  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setTempConfig(prev => ({
      ...prev,
      layout: newLayout,
      charts: prev.charts.map(chart => {
        const layoutItem = newLayout.find(l => l.i === chart.id);
        if (layoutItem) {
          return {
            ...chart,
            layout: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return chart;
      }),
    }));
  }, []);

  const displayConfig = isEditMode ? tempConfig : config;

  const renderToolbar = () => {
    if (!isEditMode) {
      return (
        <Button onClick={handleToggleEditMode} variant="outline" size="sm">
          编辑看板
        </Button>
      );
    }
    return (
      <div className="flex gap-2">
        <Button onClick={handleAddCard} variant="outline" size="sm">
          新建图表
        </Button>
        <Button onClick={handleResetDefault} variant="outline" size="sm">
          恢复默认
        </Button>
        <Button onClick={handleCancel} variant="outline" size="sm">
          取消
        </Button>
        <Button onClick={handleSave} size="sm">
          保存
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">自定义看板</h2>
        {renderToolbar()}
      </div>
      <div style={{ width: '100%' }}>
        <DashboardGrid
          charts={displayConfig.charts}
          layout={displayConfig.layout}
          isEditMode={isEditMode}
          onLayoutChange={handleLayoutChange}
          onDeleteChart={handleDeleteChart}
        />
      </div>
    </div>
  );
}
