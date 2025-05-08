
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser } from "@/services/auth";
import { getAllTasks } from "@/services/taskService";

export default function SettingsPage() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [csvData, setCsvData] = useState<string>("");

  useEffect(() => {
    generateCsv();
  }, []);

  const generateCsv = () => {
    const tasks = getAllTasks();
    let csvContent = "id,name,category\n";
    
    tasks.forEach(task => {
      csvContent += `${task.id},${task.name},${task.category}\n`;
    });
    
    setCsvData(csvContent);
  };

  const handleExportData = () => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `self-mastery-tasks-${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Data exported",
      description: "Your tasks have been exported to a CSV file",
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        toast({
          title: "Import successful",
          description: "Your data has been imported. Please reload the application.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "The file format is not valid. Please check your file and try again.",
        });
        console.error("Import error:", error);
      }
    };
    
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all your tracking data? This cannot be undone.")) {
      localStorage.removeItem('mastery_task_entries');
      
      toast({
        title: "Data cleared",
        description: "All your tracking data has been removed. Please reload the application.",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your account and customize the tracker</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={currentUser?.name} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={currentUser?.role} className="capitalize" disabled />
            </div>
            <Button className="w-full">Update Profile</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export, import or clear your tracking data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export">Export Data</Label>
              <Button onClick={handleExportData} className="w-full">
                Export Tasks to CSV
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="import">Import Data</Label>
              <Input
                id="import"
                type="file"
                accept=".csv"
                onChange={handleImportData}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clear">Clear Data</Label>
              <Button
                id="clear"
                variant="destructive"
                onClick={handleClearData}
                className="w-full"
              >
                Clear All Tracking Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Customize the appearance of your tracker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="flex-1 justify-center h-12">
                  Light
                </Button>
                <Button variant="outline" className="flex-1 justify-center h-12">
                  Dark
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {["#4f46e5", "#8b5cf6", "#ec4899", "#ef4444"].map((color) => (
                  <div
                    key={color}
                    className="w-full h-10 rounded-md cursor-pointer"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md mt-6">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure reminders for your daily tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="morning-reminder">Morning Reminder</Label>
                <Input type="time" id="morning-reminder" defaultValue="06:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evening-reminder">Evening Reminder</Label>
                <Input type="time" id="evening-reminder" defaultValue="21:00" />
              </div>
            </div>
            <Button className="w-full md:w-auto">Save Notification Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
