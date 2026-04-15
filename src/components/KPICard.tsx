import React from "react";

interface KPICardProps {
  label: string;
  value: string;
  unit?: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, unit }) => {
  return (
    <div className="bg-white border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-text-tertiary text-xs mb-2 tracking-wide">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-semibold text-text-primary leading-none">{value}</span>
        {unit && <span className="text-sm text-text-tertiary ml-0.5">{unit}</span>}
      </div>
    </div>
  );
};

export default KPICard;
