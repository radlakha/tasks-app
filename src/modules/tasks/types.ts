import type { Database } from "@/lib/database.types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
