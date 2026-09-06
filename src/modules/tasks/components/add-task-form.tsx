import { createTaskAction } from "@/modules/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddTaskForm() {
  return (
    <form action={createTaskAction} className="flex items-end gap-2">
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
    </form>
  );
}
