import { useState, useCallback, useEffect } from 'react';
import GridLayout, { type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/styles.css';
import ChartCard from '@/components/ChartCard';
import { LocalStorageAPI } from '@/lib/LocalStorageAPI';
import type { CardConfig, LayoutItem, ChartType } from '@/types/dashboard';

interface DashboardContainerProps {
  mode: 'view' | 'edit';
  onModeChange: (mode: 'view' | 'edit') => void;
  onAddCard?: (onConfirm: (config: CardConfig) => void) => void;
}

const DEFAULT_W = 6;
const DEFAULT_H = 4;

export default function DashboardContainer({ mode, onModeChange, onAddCard }: DashboardContainerProps) {
  const [cards, setCards] = useState<CardConfig[]>([]);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [containerWidth, setContainerWidth] = useState(1200);
  const isEditing = mode === 'edit';

  useEffect(() => {
    const saved = LocalStorageAPI.load();
    if (saved) {
      setCards(saved.cards);
      setLayout(saved.layout);
    }
  }, []);

  useEffect(() => {
    const el = document.getElementById('dashboard-container');
    if (!el) return;
    setContainerWidth(el.offsetWidth);
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const saveConfig = useCallback((nextCards: CardConfig[], nextLayout: LayoutItem[]) => {
    LocalStorageAPI.save({ cards: nextCards, layout: nextLayout, version: '1.0' });
  }, []);

  const addCard = useCallback((config: CardConfig) => {
    setCards(prev => {
      const next = [...prev, config];
      const newItem: LayoutItem = { i: config.id, x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H, minW: 3, minH: 3 };
      setLayout(prevLayout => {
        const nextLayout = [newItem, ...prevLayout];
        saveConfig(next, nextLayout);
        return nextLayout;
      });
      return next;
    });
  }, [saveConfig]);

  const updateCard = useCallback((id: string, partial: Partial<CardConfig>) => {
    setCards(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...partial } : c);
      saveConfig(next, layout);
      return next;
    });
  }, [layout, saveConfig]);

  const deleteCard = useCallback((id: string) => {
    setCards(prev => {
      const next = prev.filter(c => c.id !== id);
      setLayout(prevLayout => {
        const nextLayout = prevLayout.filter(l => l.i !== id);
        saveConfig(next, nextLayout);
        return nextLayout;
      });
      return next;
    });
  }, [saveConfig]);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    const mapped: LayoutItem[] = newLayout.map(l => ({
      i: l.i, x: l.x, y: l.y, w: l.w, h: l.h, minW: 3, minH: 3,
    }));
    setLayout(mapped);
    saveConfig(cards, mapped);
  }, [cards, saveConfig]);

  const handleChartTypeChange = useCallback((id: string, type: ChartType) => {
    updateCard(id, { chartType: type });
  }, [updateCard]);

  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard(addCard);
    }
  };

  return (
    <div className="w-full" id="dashboard-container">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">自定义看板</h2>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleAddCard}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              + 添加图表
            </button>
          )}
          <button
            onClick={() => onModeChange(isEditing ? 'view' : 'edit')}
            className={`px-3 py-1.5 rounded text-sm ${isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {isEditing ? '完成编辑' : '编辑看板'}
          </button>
        </div>
      </div>
      {cards.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400">
          {isEditing ? '点击「添加图表」开始构建看板' : '暂无图表，进入编辑模式添加'}
        </div>
      ) : (
        <GridLayout
          layout={layout}
          cols={12}
          rowHeight={80}
          width={containerWidth}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={handleLayoutChange}
        >
          {cards.map(card => (
            <div key={card.id}>
              <ChartCard
                config={card}
                isEditing={isEditing}
                onEdit={() => {}}
                onDelete={deleteCard}
                onChartTypeChange={handleChartTypeChange}
              />
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
}
