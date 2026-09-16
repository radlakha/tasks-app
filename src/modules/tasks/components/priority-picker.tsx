import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { cn } from "cn";
import type { TaskPriority } from "../types";

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function PriorityPicker({
  name,
  defaultValue = "medium",
}: {
  name: string;
  defaultValue?: TaskPriority;
}) {
  return (
    <RadioGroup
      name={name}
      defaultValue={defaultValue}
      className="flex flex-wrap gap-1.5"
    >
      {PRIORITY_OPTIONS.map(({ value, label }) => (
        <Radio.Root
          key={value}
          value={value}
          aria-label={label}
          className={cn(
            "flex h-8 cursor-pointer select-none items-center rounded-full border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            "hover:bg-accent hover:text-accent-foreground",
            "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
          )}
        >
          {label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}