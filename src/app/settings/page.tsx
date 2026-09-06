import { getSettings } from "@/modules/settings";
import { HideCompletedToggle } from "@/modules/settings/components/hide-completed-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Settings</h1>
        <p className="text-sm text-muted-foreground">
          These preferences are stored in the database.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            Hide completed items on the main Tasks list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HideCompletedToggle
            hideCompleted={settings.hide_completed_tasks}
          />
        </CardContent>
      </Card>
    </div>
  );
}
