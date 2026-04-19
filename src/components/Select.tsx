import React from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => {
  const handleChange = (val: string | null) => {
    if (!val || val === "__all__") {
      onChange("");
    } else {
      onChange(val);
    }
  };

  return (
    <ShadcnSelect value={value || "__all__"} onValueChange={handleChange}>
      <SelectTrigger className="w-[160px] h-8 text-sm">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">{label}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadcnSelect>
  );
};

export default Select;
