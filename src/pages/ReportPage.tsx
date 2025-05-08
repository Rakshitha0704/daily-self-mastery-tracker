
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/auth";
import { getAllTasks, getAllTaskEntries } from "@/services/taskService";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";

export default function ReportPage() {
  const [selectedReport, setSelectedReport] = useState<string>("completion");
  const [reportData, setReportData] = useState<any[]>([]);
  const [tasks, setTasks] = useState(getAllTasks());
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    generateReport();
  }, [selectedReport]);

  const generateReport = () => {
    switch(selectedReport) {
      case "completion":
        generateCompletionReport();
        break;
      case "category":
        generateCategoryReport();
        break;
      case "trend":
        generateTrendReport();
        break;
      default:
        setReportData([]);
    }
  };

  const generateCompletionReport = () => {
    const entries = getAllTaskEntries();
    
    // Get last 14 days
    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = addDays(today, -13 + i);
      return format(date, "yyyy-MM-dd");
    });
    
    const data = tasks.map(task => {
      const result: any = {
        name: task.name,
        category: task.category,
      };
      
      days.forEach(day => {
        const entry = entries.find(e => e.taskId === task.id && e.date === day);
        if (entry) {
          result[day] = entry.completed ? 100 : 0;
        } else {
          result[day] = 0;
        }
      });
      
      result.average = Object.keys(result)
        .filter(key => key !== "name" && key !== "category")
        .reduce((sum, key) => sum + result[key], 0) / days.length;
      
      return result;
    });
    
    // Sort by average completion rate
    data.sort((a, b) => b.average - a.average);
    
    setReportData(data);
  };

  const generateCategoryReport = () => {
    const entries = getAllTaskEntries();
    const categories = [...new Set(tasks.map(task => task.category))];
    
    const data = categories.map(category => {
      const categoryTasks = tasks.filter(task => task.category === category);
      const categoryEntries = entries.filter(entry => {
        const task = tasks.find(t => t.id === entry.taskId);
        return task?.category === category;
      });
      
      const totalPossible = categoryTasks.length * 100;
      const totalCompleted = categoryEntries.filter(e => e.completed).length * 100;
      
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0,
        total: categoryTasks.length
      };
    });
    
    // Sort by completion percentage
    data.sort((a, b) => b.value - a.value);
    
    setReportData(data);
  };

  const generateTrendReport = () => {
    const entries = getAllTaskEntries();
    
    // Get daily completion for last 30 days
    const today = new Date();
    const data = Array.from({ length: 30 }, (_, i) => {
      const date = addDays(today, -29 + i);
      const formattedDate = format(date, "yyyy-MM-dd");
      
      const dayEntries = entries.filter(e => e.date === formattedDate);
      const completed = dayEntries.filter(e => e.completed).length;
      const total = tasks.length;
      
      return {
        date: formattedDate,
        name: format(date, "MMM dd"),
        value: total > 0 ? (completed / total) * 100 : 0
      };
    });
    
    setReportData(data);
  };

  const exportToCsv = () => {
    if (reportData.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header row
    const headers = Object.keys(reportData[0]);
    csvContent += headers.join(",") + "\n";
    
    // Add data rows
    reportData.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        // Handle strings with commas by wrapping in quotes
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `self-mastery-${selectedReport}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCompletionChart = () => (
    <div className="h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={reportData.slice(0, 10)}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}%`, 'Completion Rate']}
          />
          <Legend />
          <Bar 
            dataKey="average" 
            name="Average Completion" 
            fill="#4f46e5" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderCategoryChart = () => (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={reportData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value, name, props) => [
              `${value.toFixed(1)}%`,
              'Completion Rate'
            ]}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            name="Category Completion Rate" 
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          >
            {reportData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${250 + index * 20}, 70%, 60%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTrendChart = () => (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={reportData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}%`, 'Completion Rate']}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            name="Daily Completion Rate" 
            fill="#c084fc"
            radius={[4, 4, 0, 0]}
          >
            {reportData.map((entry, index) => {
              // Color based on value
              const value = entry.value;
              let color = "#ef4444"; // red for low
              if (value >= 80) color = "#22c55e"; // green for high
              else if (value >= 50) color = "#eab308"; // yellow for medium
              
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Activity Report</h1>
          <p className="text-muted-foreground">Advanced analytics and insights on your progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completion">Task Completion Rankings</SelectItem>
              <SelectItem value="category">Category Analysis</SelectItem>
              <SelectItem value="trend">30-Day Trend Analysis</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={exportToCsv} 
            disabled={reportData.length === 0}
            title="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>
            {selectedReport === "completion" && "Task Completion Rankings"}
            {selectedReport === "category" && "Category Analysis"}
            {selectedReport === "trend" && "30-Day Trend Analysis"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.length > 0 ? (
            <>
              {selectedReport === "completion" && renderCompletionChart()}
              {selectedReport === "category" && renderCategoryChart()}
              {selectedReport === "trend" && renderTrendChart()}
            </>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No data available for this report
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedReport === "completion" && reportData.length > 0 && (
        <Card className="shadow-md mt-6">
          <CardHeader className="pb-2">
            <CardTitle>Detailed Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-sm text-muted-foreground">
                    <th className="font-medium text-left py-3 px-4 border-b">Task</th>
                    <th className="font-medium text-left py-3 px-4 border-b">Category</th>
                    <th className="font-medium text-right py-3 px-4 border-b">Avg. Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((task, index) => (
                    <tr key={index} className="hover:bg-muted/30">
                      <td className="text-left py-3 px-4 border-b">{task.name}</td>
                      <td className="text-left py-3 px-4 border-b capitalize">{task.category}</td>
                      <td className="text-right py-3 px-4 border-b">
                        <span 
                          className={`font-medium ${
                            task.average >= 80 
                              ? 'text-green-600' 
                              : task.average >= 50 
                                ? 'text-amber-600' 
                                : 'text-red-500'
                          }`}
                        >
                          {task.average.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
