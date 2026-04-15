import { useMemo } from 'react';
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ChartCard from './ChartCard';
import { GRID_CONFIG } from '@/constants/dashboard';
import type { DashboardCard, ChartType } from '@/types/dashboard';

interface DashboardGridProps {
  cards: DashboardCard[];
  isEditing: boolean;
  onLayoutChange: (layout: Layout[]) => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onChartTypeChange: (cardId: string, type: ChartType) => void;
}

export default function DashboardGrid({
  cards,
  isEditing,
  onLayoutChange,
  onEditCard,
  onDeleteCard,
  onChartTypeChange,
}: DashboardGridProps) {
  const { width, containerRef } = useContainerWidth();

  const layout = useMemo(
    () =>
      cards.map((card) => ({
        i: card.config.id,
        x: card.grid.x,
        y: card.grid.y,
        w: card.grid.w,
        h: card.grid.h,
        minW: GRID_CONFIG.minW,
        minH: GRID_CONFIG.minH,
      })),
    [cards]
  );

  const gridConfig = useMemo(
    () => ({
      cols: GRID_CONFIG.cols,
      rowHeight: GRID_CONFIG.rowHeight,
      margin: GRID_CONFIG.margin,
      containerPadding: GRID_CONFIG.containerPadding,
    }),
    []
  );

  return (
    <div ref={containerRef} className={isEditing ? 'dashboard-editing' : ''}>
      {width > 0 && (
        <GridLayout
          layout={layout}
          width={width}
          gridConfig={gridConfig}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={onLayoutChange}
          draggableHandle=".drag-handle"
        >
          {cards.map((card) => (
            <div key={card.config.id}>
              <ChartCard
                config={card.config}
                isEditing={isEditing}
                onEdit={() => onEditCard(card.config.id)}
                onDelete={() => onDeleteCard(card.config.id)}
                onChartTypeChange={(type) => onChartTypeChange(card.config.id, type)}
              />
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
}
