import { createTaskAction } from "@/modules/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriorityPicker } from "./priority-picker";

export function AddTaskForm() {
  return (
    <form action={createTaskAction} className="grid gap-3">
      <div className="flex items-end gap-2">
        <div className="grid flex-1 gap-1.5">
          <Label htmlFor="title">New task</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="What needs doing?"
            autoComplete="off"
          />
        </div>
        <Button type="submit">Add</Button>
      </div>
      <div className="grid gap-1.5">
        <Label>Priority</Label>
        <PriorityPicker name="priority" defaultValue="medium" />
      </div>
    </form>
  );
}
