"use client";

import { useState } from "react";
import type { Task, TaskPriority } from "@/modules/tasks";
import {
  setTaskArchivedAction,
  setTaskCompletedAction,
  updateTaskAction,
} from "@/modules/tasks/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriorityPicker } from "./priority-picker";

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITY_BADGE_VARIANT: Record<
  TaskPriority,
  "outline" | "secondary" | "destructive"
> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
};

export function TaskItem({
  task,
  variant,
}: {
  task: Task;
  variant: "active" | "archived";
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p
          className={
            task.completed
              ? "text-muted-foreground line-through"
              : "font-medium"
          }
        >
          {task.title}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]}>
            {PRIORITY_LABEL[task.priority]}
          </Badge>
          {task.completed ? (
            <Badge variant="secondary">Done</Badge>
          ) : (
            <Badge variant="outline">Open</Badge>
          )}
          {variant === "archived" ? (
            <Badge variant="outline">Archived</Badge>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {variant === "active" ? (
          <>
            <form
              action={setTaskCompletedAction.bind(
                null,
                task.id,
                !task.completed,
              )}
            >
              <Button type="submit" variant="outline" size="sm">
                {task.completed ? "Mark undone" : "Mark done"}
              </Button>
            </form>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button variant="outline" size="sm" />}>
                Edit
              </DialogTrigger>
              <DialogContent>
                <form
                  action={async (formData) => {
                    await updateTaskAction(formData);
                    setOpen(false);
                  }}
                  className="grid gap-4"
                >
                  <DialogHeader>
                    <DialogTitle>Edit task</DialogTitle>
                    <DialogDescription>
                      Update the task title. This does not delete the task.
                    </DialogDescription>
                  </DialogHeader>
                  <input type="hidden" name="id" value={task.id} />
                  <div className="grid gap-1.5">
                    <Label htmlFor={`title-${task.id}`}>Title</Label>
                    <Input
                      id={`title-${task.id}`}
                      name="title"
                      required
                      defaultValue={task.title}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Priority</Label>
                    <PriorityPicker
                      name="priority"
                      defaultValue={task.priority}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <form action={setTaskArchivedAction.bind(null, task.id, true)}>
              <Button type="submit" variant="secondary" size="sm">
                Archive
              </Button>
            </form>
          </>
        ) : (
          <form action={setTaskArchivedAction.bind(null, task.id, false)}>
            <Button type="submit" variant="outline" size="sm">
              Unarchive
            </Button>
          </form>
        )}
      </div>
    </li>
  );
}
