
import { useState, useEffect } from "react";
import { 
  format, 
  startOfWeek, 
  addDays, 
  isToday,
  isSameDay
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAllTasks,
  getTaskEntriesForDate,
} from "@/services/taskService";
import { Task, TaskEntry } from "@/types";
import { Check, Minus, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/services/auth";

type TaskStatus = {
  [key: string]: {
    [key: string]: {
      completed: boolean;
      value?: string;
    }
  }
};

export default function WeeklyViewPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus>({});
  const [activeTab, setActiveTab] = useState<"table" | "summary">("table");
  const currentUser = getCurrentUser();

  useEffect(() => {
    generateWeekDates();
    loadTasks();
  }, [selectedDate]);

  const generateWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDates(dates);
    loadTaskStatuses(dates);
  };

  const loadTasks = () => {
    const allTasks = getAllTasks();
    setTasks(allTasks);
  };

  const loadTaskStatuses = async (dates: Date[]) => {
    const statuses: TaskStatus = {};
    
    for (const date of dates) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const entries = getTaskEntriesForDate(formattedDate);
      
      if (!statuses[formattedDate]) {
        statuses[formattedDate] = {};
      }
      
      entries.forEach((entry: TaskEntry) => {
        statuses[formattedDate][entry.taskId] = {
          completed: entry.completed,
          value: entry.value,
        };
      });
    }
    
    setTaskStatuses(statuses);
  };

  const previousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const getStatusCell = (task: Task, date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const status = taskStatuses[formattedDate]?.[task.id];
    
    if (!status) {
      return (
        <div className="flex justify-center">
          <Minus className="text-gray-300" />
        </div>
      );
    }

    if (task.name === "SCREEN TIME" && status.value) {
      return (
        <div className="text-center text-sm font-medium">
          {status.value}
        </div>
      );
    }

    if (status.completed) {
      return (
        <div className="flex justify-center">
          <Check className="text-green-600" />
        </div>
      );
    }

    return (
      <div className="flex justify-center">
        <AlertCircle className="text-red-400" size={16} />
      </div>
    );
  };

  const getDayCompletionRate = (date: Date): number => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const statuses = taskStatuses[formattedDate];
    
    if (!statuses) return 0;
    
    const taskIds = Object.keys(statuses);
    if (taskIds.length === 0) return 0;
    
    const completedCount = taskIds.filter(id => {
      // Consider "SCREEN TIME" as completed if it has a value
      const task = tasks.find(t => t.id === id);
      if (task?.name === "SCREEN TIME") {
        return !!statuses[id].value;
      }
      return statuses[id].completed;
    }).length;
    
    return (completedCount / tasks.length) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Weekly View</h1>
      <p className="text-muted-foreground mb-6">Review your consistency across the week</p>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Week of {format(weekDates[0] || new Date(), 'MMMM d, yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={previousWeek}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Previous Week
          </button>
          <button 
            onClick={nextWeek}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            disabled={weekDates[0] && new Date() < weekDates[0]}
          >
            Next Week
          </button>
        </div>
      </div>

      <Tabs 
        defaultValue="table"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "table" | "summary")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="table">Task Table</TabsTrigger>
          <TabsTrigger value="summary">Weekly Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card className="shadow-md">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Weekly Task Completion</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="text-sm text-muted-foreground">
                    <th className="font-medium text-left py-3 px-4 border-b">Task</th>
                    {weekDates.map((date) => (
                      <th 
                        key={date.toString()} 
                        className={`font-medium text-center py-3 px-4 border-b ${
                          isToday(date) 
                            ? 'bg-mastery-accent/20' 
                            : ''
                        }`}
                      >
                        <div className="whitespace-nowrap">{format(date, 'EEE')}</div>
                        <div className="text-xs text-muted-foreground">{format(date, 'MMM d')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-muted/30">
                      <td className="text-left py-3 px-4 border-b text-sm">
                        <div>{task.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{task.category}</div>
                      </td>
                      {weekDates.map(date => (
                        <td 
                          key={`${task.id}-${date.toString()}`} 
                          className={`text-center py-3 px-4 border-b ${
                            isToday(date) 
                              ? 'bg-mastery-accent/10' 
                              : ''
                          }`}
                        >
                          {getStatusCell(task, date)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDates.map((date, index) => {
              const completionRate = getDayCompletionRate(date);
              const isPast = date <= new Date();
              
              return (
                <Card 
                  key={date.toString()} 
                  className={`card-hover ${
                    isToday(date) 
                      ? 'border-mastery-primary' 
                      : ''
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{format(date, 'EEEE')}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(date, 'MMM d')}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-32 flex flex-col items-center justify-center">
                      <svg className="w-24 h-24">
                        <circle
                          className="text-muted/30"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="48"
                          cy="48"
                        />
                        <circle
                          className={`${
                            completionRate >= 80 
                              ? 'text-green-500' 
                              : completionRate >= 50 
                                ? 'text-amber-500' 
                                : 'text-red-500'
                          }`}
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 40 * (completionRate / 100)} ${2 * Math.PI * 40}`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="48"
                          cy="48"
                          transform="rotate(-90 48 48)"
                        />
                      </svg>
                      <div className="absolute text-2xl font-bold">
                        {isPast ? `${Math.round(completionRate)}%` : '--'}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center text-sm">
                      {isPast ? (
                        completionRate >= 80 ? (
                          <div className="text-green-600 font-medium">Excellent day!</div>
                        ) : completionRate >= 50 ? (
                          <div className="text-amber-600 font-medium">Good progress</div>
                        ) : completionRate > 0 ? (
                          <div className="text-red-500 font-medium">Needs improvement</div>
                        ) : (
                          <div className="text-muted-foreground">No data recorded</div>
                        )
                      ) : (
                        <div className="text-muted-foreground">Future date</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
