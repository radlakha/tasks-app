import type { Database } from "@/lib/database.types";

export type TaskPriority = "low" | "medium" | "high";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
