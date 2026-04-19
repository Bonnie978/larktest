import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { DashboardCard } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  cards: DashboardCard[];
  layouts: Layout[];
  editing: boolean;
  onLayoutChange: (layout: Layout[]) => void;
  onRemoveCard?: (id: string) => void;
}

export default function DashboardGrid({
  cards,
  layouts,
  editing,
  onLayoutChange,
  onRemoveCard,
}: DashboardGridProps) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layouts }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={60}
      isDraggable={editing}
      isResizable={editing}
      onLayoutChange={(layout) => onLayoutChange(layout)}
      draggableHandle=".drag-handle"
    >
      {cards.map((card) => (
        <div key={card.i}>
          <Card className="h-full shadow-sm overflow-hidden">
            <CardHeader className="pb-0 pt-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className={`text-[15px] font-medium ${editing ? 'drag-handle cursor-move' : ''}`}>
                {card.title}
              </CardTitle>
              {editing && onRemoveCard && (
                <button
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  onClick={() => onRemoveCard(card.i)}
                >
                  ✕
                </button>
              )}
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[calc(100%-40px)] text-sm text-muted-foreground">
              {card.title} 图表区域
            </CardContent>
          </Card>
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
