import { Settings, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardToolbarProps {
  isEditing: boolean;
  onEnterEdit: () => void;
  onNewChart: () => void;
  onReset: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function DashboardToolbar({
  isEditing,
  onEnterEdit,
  onNewChart,
  onReset,
  onCancel,
  onSave,
}: DashboardToolbarProps) {
  if (!isEditing) {
    return (
      <Button variant="outline" size="sm" onClick={onEnterEdit}>
        <Settings className="w-4 h-4 mr-1.5" />
        编辑仪表盘
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={onNewChart}>
        <Plus className="w-4 h-4 mr-1.5" />
        新建图表
      </Button>
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="w-4 h-4 mr-1.5" />
        恢复默认
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        取消
      </Button>
      <Button size="sm" onClick={onSave}>
        保存
      </Button>
    </div>
  );
}
