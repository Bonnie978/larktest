import React, { useEffect } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  width = "480px",
  children,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 抽屉面板 */}
      <div
        className={`absolute top-0 right-0 h-full bg-white shadow-lg flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width }}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary text-lg leading-none"
          >
            X
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
