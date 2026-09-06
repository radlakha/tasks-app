"use client";

import { useTransition } from "react";
import { updateThemeAction } from "@/modules/settings/actions";
import type { ThemePreference } from "@/modules/settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle({ theme }: { theme: ThemePreference }) {
  const [pending, startTransition] = useTransition();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor="theme" className="text-sm font-medium">
        Dark theme
      </Label>
      <Switch
        id="theme"
        checked={isDark}
        disabled={pending}
        onCheckedChange={(checked) => {
          startTransition(() => {
            void updateThemeAction(checked ? "dark" : "light");
          });
        }}
      />
    </div>
  );
}
