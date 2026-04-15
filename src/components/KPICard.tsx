import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  label: string;
  value: string;
  unit?: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, unit }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-1">
        <div className="text-muted-foreground text-xs mb-2 tracking-wide">
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight">{value}</span>
          {unit && (
            <span className="text-sm text-muted-foreground ml-0.5">
              {unit}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
