import React from "react";
import { Badge } from "@/components/ui/badge";

interface TagProps {
  type: "success" | "warning" | "danger" | "default";
  children: React.ReactNode;
}

const styleMap: Record<TagProps["type"], string> = {
  success: "bg-[#E8FFEA] text-[#00B42A] hover:bg-[#E8FFEA] border-transparent",
  warning: "bg-[#FFF7E8] text-[#FF7D00] hover:bg-[#FFF7E8] border-transparent",
  danger: "bg-[#FFECE8] text-[#F53F3F] hover:bg-[#FFECE8] border-transparent",
  default: "bg-muted text-muted-foreground hover:bg-muted border-transparent",
};

const Tag: React.FC<TagProps> = ({ type, children }) => {
  return (
    <Badge variant="outline" className={styleMap[type]}>
      {children}
    </Badge>
  );
};

export default Tag;
