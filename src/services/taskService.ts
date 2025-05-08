
import { Task, TaskCategory, TaskEntry, DailyProgress, ChartData } from "@/types";

// Default tasks
const DEFAULT_TASKS: Task[] = [
  { id: "task1", name: "VISUALIZATION - MORNING", category: "morning" },
  { id: "task2", name: "SMILE AT THE MIRROR", category: "morning" },
  { id: "task3", name: "READING NEWSPAPER", category: "productivity" },
  { id: "task4", name: "PODCAST/ CURRENT TREND NEWS", category: "self-development" },
  { id: "task5", name: "PROFESSIONAL FRIEND", category: "self-development" },
  { id: "task6", name: "ENGLISH SONG", category: "self-development" },
  { id: "task7", name: "READING BOOK", category: "self-development" },
  { id: "task8", name: "ENGLISH COMMUNICATION", category: "self-development" },
  { id: "task9", name: "ACHIEVEMENTS", category: "productivity" },
  { id: "task10", name: "EXERCISE", category: "wellness" },
  { id: "task11", name: "GRATITUDE JOURNAL", category: "wellness" },
  { id: "task12", name: "PHONE- OFF (9pm - 6am)", category: "evening" },
  { id: "task13", name: "WAKE UP BEFORE 6 AM", category: "morning" },
  { id: "task14", name: "VISUALIZATION - NIGHT", category: "evening" },
  { id: "task15", name: "SCREEN TIME", category: "productivity" },
];

// Local storage keys
const TASKS_KEY = 'mastery_tasks';
const ENTRIES_KEY = 'mastery_task_entries';

// Initialize tasks in local storage if not exist
const initializeTasks = (): void => {
  if (!localStorage.getItem(TASKS_KEY)) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(DEFAULT_TASKS));
  }
  
  if (!localStorage.getItem(ENTRIES_KEY)) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify([]));
  }
};

// Get all tasks
export const getAllTasks = (): Task[] => {
  initializeTasks();
  return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
};

// Get task by ID
export const getTaskById = (id: string): Task | undefined => {
  const tasks = getAllTasks();
  return tasks.find(task => task.id === id);
};

// Add a new task
export const addTask = (task: Omit<Task, "id">): Task => {
  const tasks = getAllTasks();
  const newTask: Task = {
    ...task,
    id: `task${Date.now()}`,
  };
  
  localStorage.setItem(TASKS_KEY, JSON.stringify([...tasks, newTask]));
  return newTask;
};

// Save task entry
export const saveTaskEntry = (entry: TaskEntry): void => {
  const entries = getAllTaskEntries();
  const existingEntryIndex = entries.findIndex(
    e => e.taskId === entry.taskId && e.date === entry.date
  );
  
  if (existingEntryIndex >= 0) {
    entries[existingEntryIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

// Get all task entries
export const getAllTaskEntries = (): TaskEntry[] => {
  initializeTasks();
  return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
};

// Get task entries for a specific date
export const getTaskEntriesForDate = (date: string): TaskEntry[] => {
  const entries = getAllTaskEntries();
  return entries.filter(entry => entry.date === date);
};

// Get task entries for a specific user (in a real app, we'd filter by user ID)
export const getTaskEntriesForUser = (userId: string): TaskEntry[] => {
  // In a real app, entries would have a userId field
  return getAllTaskEntries();
};

// Calculate daily progress
export const getDailyProgress = (date: string): DailyProgress => {
  const tasks = getAllTasks();
  const entries = getTaskEntriesForDate(date);
  const totalTasks = tasks.length;
  const completedTasks = entries.filter(entry => entry.completed).length;
  
  const screenTimeEntry = entries.find(
    entry => getTaskById(entry.taskId)?.name === "SCREEN TIME"
  );
  
  return {
    date,
    completedTasks,
    totalTasks,
    screenTime: screenTimeEntry?.value as string,
  };
};

// Get weekly progress
export const getWeeklyProgress = (startDate: Date): DailyProgress[] => {
  const result: DailyProgress[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    const date = currentDate.toISOString().split('T')[0];
    result.push(getDailyProgress(date));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
};

// Get monthly progress
export const getMonthlyProgress = (year: number, month: number): DailyProgress[] => {
  const result: DailyProgress[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day).toISOString().split('T')[0];
    result.push(getDailyProgress(date));
  }
  
  return result;
};

// Generate chart data for completed tasks
export const getCompletionRateChartData = (
  progressArray: DailyProgress[]
): ChartData => {
  return progressArray.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: day.completedTasks / day.totalTasks * 100,
  }));
};

// Get category completion data
export const getCategoryCompletionData = (date: string): ChartData => {
  const tasks = getAllTasks();
  const entries = getTaskEntriesForDate(date);
  const categories = [...new Set(tasks.map(task => task.category))];
  
  return categories.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const completedCategoryTasks = entries.filter(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      return task?.category === category && entry.completed;
    });
    
    return {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: completedCategoryTasks.length / categoryTasks.length * 100 || 0,
    };
  });
};
