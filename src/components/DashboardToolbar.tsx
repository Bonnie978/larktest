import React from 'react';
import { Button } from '@/components/ui/button';

export interface DashboardToolbarProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  onAddCard: () => void;
}

const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onReset,
  onAddCard,
}) => {
  if (!isEditing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={onEdit}>
          编辑仪表盘
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onAddCard}>
        新建图表
      </Button>
      <Button variant="ghost" onClick={onReset}>
        恢复默认
      </Button>
      <Button variant="ghost" onClick={onCancel}>
        取消
      </Button>
      <Button variant="default" className="bg-primary" onClick={onSave}>
        保存
      </Button>
    </div>
  );
};

export default DashboardToolbar;
