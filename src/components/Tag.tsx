import React from "react";

interface TagProps {
  type: "success" | "warning" | "danger" | "default";
  children: React.ReactNode;
}

const styleMap: Record<TagProps["type"], string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  default: "bg-bg-header text-text-secondary",
};

const Tag: React.FC<TagProps> = ({ type, children }) => {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium inline-block ${styleMap[type]}`}
    >
      {children}
    </span>
  );
};

export default Tag;
