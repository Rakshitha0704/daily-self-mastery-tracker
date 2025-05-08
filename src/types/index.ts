
export interface User {
  id: string;
  name: string;
  role: "student" | "mentor";
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  category: TaskCategory;
}

export type TaskCategory = 
  | "morning"
  | "productivity" 
  | "self-development" 
  | "wellness" 
  | "evening";

export interface TaskEntry {
  taskId: string;
  date: string;
  completed: boolean;
  value?: number | string;
  notes?: string;
}

export interface DailyProgress {
  date: string;
  completedTasks: number;
  totalTasks: number;
  screenTime?: string;
}

export type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";

export type ChartData = {
  name: string;
  value: number;
}[];
