"use client";

import { useTransition } from "react";
import { updateHideCompletedAction } from "@/modules/settings/actions";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function HideCompletedToggle({
  hideCompleted,
}: {
  hideCompleted: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor="hide-completed" className="text-base font-medium">
        Hide Completed Tasks
      </Label>
      <Switch
        id="hide-completed"
        checked={hideCompleted}
        disabled={pending}
        onCheckedChange={(checked) => {
          startTransition(() => {
            void updateHideCompletedAction(checked);
          });
        }}
      />
    </div>
  );
}
