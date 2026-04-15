// src/components/DashboardGridStack.tsx
import { useRef, useEffect, useCallback } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import type { GridPosition, CardConfig } from '@/types/dashboard';

export interface DashboardGridItem {
  config: CardConfig;
  grid: GridPosition;
}

interface DashboardGridStackProps {
  items: DashboardGridItem[];
  isEditing: boolean;
  onLayoutChange: (positions: Array<{ id: string; grid: GridPosition }>) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (cardId: string) => void;
  renderCard: (config: CardConfig) => React.ReactNode;
}

export default function DashboardGridStack({
  items,
  isEditing,
  onLayoutChange,
  onDeleteCard,
  onEditCard,
  renderCard,
}: DashboardGridStackProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gsRef = useRef<GridStack | null>(null);

  // 初始化 gridstack
  useEffect(() => {
    if (!gridRef.current || gsRef.current) return;
    const grid = GridStack.init(
      {
        column: 12,
        cellHeight: 80,
        margin: 12,
        float: false,
        animate: true,
        disableOneColumnMode: true,
        removable: false,
      },
      gridRef.current
    );
    gsRef.current = grid;

    grid.on('change', () => {
      const nodes = grid.getGridItems().map((el) => {
        const node = el.gridstackNode;
        return {
          id: node?.id || '',
          grid: {
            x: node?.x ?? 0,
            y: node?.y ?? 0,
            w: node?.w ?? 6,
            h: node?.h ?? 4,
          },
        };
      });
      onLayoutChange(nodes);
    });

    return () => {
      grid.destroy(false);
      gsRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 编辑模式切换
  useEffect(() => {
    const grid = gsRef.current;
    if (!grid) return;
    if (isEditing) {
      grid.enableMove(true);
      grid.enableResize(true);
    } else {
      grid.enableMove(false);
      grid.enableResize(false);
    }
  }, [isEditing]);

  // 同步 items 到 gridstack
  const syncItems = useCallback(() => {
    const grid = gsRef.current;
    if (!grid) return;
    grid.batchUpdate();
    grid.removeAll(false);
    items.forEach((item) => {
      const el = document.getElementById(`gs-card-${item.config.id}`);
      if (el) {
        grid.addWidget(el, {
          id: item.config.id,
          x: item.grid.x,
          y: item.grid.y,
          w: item.grid.w,
          h: item.grid.h,
          minW: 4,
          minH: 4,
        });
      }
    });
    grid.batchUpdate(false);
  }, [items]);

  useEffect(() => {
    // 延迟一帧让 React 渲染 DOM 后再同步
    requestAnimationFrame(syncItems);
  }, [syncItems]);

  return (
    <div ref={gridRef} className="grid-stack">
      {items.map((item) => (
        <div
          key={item.config.id}
          id={`gs-card-${item.config.id}`}
          className="grid-stack-item"
          gs-id={item.config.id}
          gs-x={item.grid.x}
          gs-y={item.grid.y}
          gs-w={item.grid.w}
          gs-h={item.grid.h}
          gs-min-w={4}
          gs-min-h={4}
        >
          <div className={`grid-stack-item-content rounded-lg overflow-hidden ${isEditing ? 'ring-2 ring-dashed ring-primary/30' : ''}`}>
            {isEditing && (
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <button
                  onClick={() => onEditCard(item.config.id)}
                  className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center hover:bg-primary/80 shadow"
                >
                  ✎
                </button>
                <button
                  onClick={() => onDeleteCard(item.config.id)}
                  className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 shadow"
                >
                  ✕
                </button>
              </div>
            )}
            {renderCard(item.config)}
          </div>
        </div>
      ))}
    </div>
  );
}
