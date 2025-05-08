
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  getAllTasks,
  getTaskEntriesForDate,
  saveTaskEntry,
  getDailyProgress,
  getCategoryCompletionData
} from "@/services/taskService";
import { Task, TaskEntry } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function DailyTasksPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskEntries, setTaskEntries] = useState<Record<string, TaskEntry>>({});
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = () => {
    const allTasks = getAllTasks();
    setTasks(allTasks);
    
    const entries = getTaskEntriesForDate(selectedDate);
    const entriesMap: Record<string, TaskEntry> = {};
    
    entries.forEach(entry => {
      entriesMap[entry.taskId] = entry;
    });
    
    setTaskEntries(entriesMap);
    
    const dailyProgress = getDailyProgress(selectedDate);
    setProgress({
      completed: dailyProgress.completedTasks,
      total: dailyProgress.totalTasks
    });
    
    setCategoryData(getCategoryCompletionData(selectedDate));
  };

  const handleToggleTask = (task: Task) => {
    const existingEntry = taskEntries[task.id];
    
    const newEntry: TaskEntry = {
      taskId: task.id,
      date: selectedDate,
      completed: existingEntry ? !existingEntry.completed : true,
      value: existingEntry?.value || "",
    };
    
    saveTaskEntry(newEntry);
    
    setTaskEntries(prev => ({
      ...prev,
      [task.id]: newEntry,
    }));
    
    loadData();
    
    toast({
      title: newEntry.completed ? "Task completed!" : "Task marked as incomplete",
      description: `"${task.name}" has been updated for ${formatDate(selectedDate)}`,
    });
  };

  const handleScreenTimeChange = (task: Task, value: string) => {
    const newEntry: TaskEntry = {
      taskId: task.id,
      date: selectedDate,
      completed: true,
      value,
    };
    
    saveTaskEntry(newEntry);
    
    setTaskEntries(prev => ({
      ...prev,
      [task.id]: newEntry,
    }));
    
    loadData();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const COLORS = ['#4f46e5', '#8b5cf6', '#c084fc', '#a78bfa', '#9333ea'];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Daily Tasks</h1>
          <p className="text-muted-foreground">Track your habits and build self-discipline</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="font-medium">Select Date:</div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 card-gradient shadow-md border-mastery-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Tasks for {formatDate(selectedDate)}</CardTitle>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={(progress.completed / progress.total) * 100} className="h-2" />
              <span className="text-sm font-medium">{progress.completed}/{progress.total}</span>
            </div>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`task-item flex items-center justify-between p-3 rounded-lg border 
                    ${taskEntries[task.id]?.completed 
                      ? 'bg-mastery-accent/20 border-mastery-accent' 
                      : 'bg-white border-border'}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{task.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{task.category}</span>
                  </div>
                  <div>
                    {task.name === "SCREEN TIME" ? (
                      <Input 
                        type="text"
                        placeholder="HH:MM format"
                        className="w-32 text-sm"
                        value={taskEntries[task.id]?.value || ''}
                        onChange={(e) => handleScreenTimeChange(task, e.target.value)}
                      />
                    ) : (
                      <Button
                        variant={taskEntries[task.id]?.completed ? "default" : "outline"}
                        className={taskEntries[task.id]?.completed ? "bg-mastery-primary" : ""}
                        onClick={() => handleToggleTask(task)}
                      >
                        {taskEntries[task.id]?.completed ? "Completed" : "Mark Complete"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-mastery-accent/20 bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => entry.name}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Math.round(Number(value))}%`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available for selected date
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-2">
              <h3 className="font-medium text-sm">Category Legend</h3>
              <div className="grid grid-cols-2 gap-2">
                {categoryData.map((category, index) => (
                  <div key={category.name} className="flex items-center text-sm">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="capitalize">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
