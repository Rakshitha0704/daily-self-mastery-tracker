
import { useState, useEffect } from "react";
import { format, startOfWeek, startOfMonth, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWeeklyProgress, getMonthlyProgress } from "@/services/taskService";
import { DailyProgress } from "@/types";

export default function ProgressDashboardPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [weeklyData, setWeeklyData] = useState<DailyProgress[]>([]);
  const [monthlyData, setMonthlyData] = useState<DailyProgress[]>([]);

  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (activeTab === "weekly") {
      const data = getWeeklyProgress(selectedWeekStart);
      setWeeklyData(data);
    } else {
      const data = getMonthlyProgress(selectedMonth.getFullYear(), selectedMonth.getMonth());
      setMonthlyData(data);
    }
  }, [activeTab, selectedWeekStart, selectedMonth]);

  const transformedWeeklyData = weeklyData.map(day => ({
    name: format(new Date(day.date), 'EEE'),
    value: (day.completedTasks / day.totalTasks) * 100
  }));

  const transformedMonthlyData = monthlyData.map(day => ({
    name: format(new Date(day.date), 'd'),
    value: (day.completedTasks / day.totalTasks) * 100
  }));

  const averageCompletionRate = (data: DailyProgress[]): number => {
    if (data.length === 0) return 0;
    const totalRate = data.reduce((sum, day) => sum + (day.completedTasks / day.totalTasks), 0);
    return (totalRate / data.length) * 100;
  };

  const bestDay = (data: DailyProgress[]): { day: string; rate: number } => {
    if (data.length === 0) return { day: "N/A", rate: 0 };
    
    let maxIndex = 0;
    let maxRate = 0;
    
    data.forEach((day, index) => {
      const rate = day.completedTasks / day.totalTasks;
      if (rate > maxRate) {
        maxRate = rate;
        maxIndex = index;
      }
    });
    
    return { 
      day: format(new Date(data[maxIndex].date), 'EEEE'), 
      rate: maxRate * 100 
    };
  };

  const streakCalculation = (data: DailyProgress[]): number => {
    if (data.length === 0) return 0;
    
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (const day of data) {
      if (day.completedTasks / day.totalTasks >= 0.8) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  };

  const handlePreviousWeek = () => {
    const prevWeek = new Date(selectedWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setSelectedWeekStart(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(selectedWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    if (nextWeek <= new Date()) {
      setSelectedWeekStart(nextWeek);
    }
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    if (nextMonth <= new Date()) {
      setSelectedMonth(nextMonth);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Progress Dashboard</h1>
      <p className="text-muted-foreground mb-6">Track your self-mastery journey over time</p>

      <Tabs 
        defaultValue="weekly" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "weekly" | "monthly")}
        className="mb-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">Weekly Progress</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Week of {format(selectedWeekStart, 'MMMM d, yyyy')}
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={handlePreviousWeek}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={handleNextWeek}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                disabled={new Date(selectedWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000) > new Date()}
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-mastery-primary">
                  {averageCompletionRate(weeklyData).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">of tasks completed</p>
              </CardContent>
            </Card>
            
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Best Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-mastery-primary">
                  {bestDay(weeklyData).day}
                </div>
                <p className="text-sm text-muted-foreground">
                  {bestDay(weeklyData).rate.toFixed(1)}% completion
                </p>
              </CardContent>
            </Card>
            
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">80%+ Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-mastery-primary">
                  {streakCalculation(weeklyData)} days
                </div>
                <p className="text-sm text-muted-foreground">consecutive 80%+ days</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md border-border">
            <CardHeader>
              <CardTitle>Weekly Progress Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={transformedWeeklyData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {format(selectedMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={handlePreviousMonth}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={handleNextMonth}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                disabled={new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1) > new Date()}
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-mastery-primary">
                  {averageCompletionRate(monthlyData).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">of tasks completed</p>
              </CardContent>
            </Card>
            
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Days Above 80%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-mastery-primary">
                  {monthlyData.filter(day => (day.completedTasks / day.totalTasks) >= 0.8).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  out of {monthlyData.length} days
                </p>
              </CardContent>
            </Card>
            
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Longest Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-mastery-primary">
                  {streakCalculation(monthlyData)} days
                </div>
                <p className="text-sm text-muted-foreground">consecutive 80%+ days</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md border-border">
            <CardHeader>
              <CardTitle>Monthly Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transformedMonthlyData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Completion Rate" 
                      fill="#8b5cf6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
