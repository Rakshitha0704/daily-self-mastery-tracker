
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { logout, isAuthenticated, getCurrentUser } from "@/services/auth";
import NavMenu from "./NavMenu";
import { useToast } from "@/components/ui/use-toast";

export default function MainLayout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  if (!isMounted) return null;

  const currentUser = getCurrentUser();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/login");
  };

  if (!currentUser) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar defaultCollapsed={false} className="border-r border-border">
          <SidebarHeader className="py-6 px-3 border-b border-border">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mastery-primary to-mastery-secondary flex items-center justify-center text-white font-heading text-xl">
                SM
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight">Self Mastery</h1>
                <p className="text-xs text-muted-foreground">Daily Tracker</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <NavMenu />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-md bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-mastery-secondary/20 flex items-center justify-center text-mastery-secondary font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
          <header className="h-16 border-b border-border flex items-center px-4 justify-between sticky top-0 bg-background z-10">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold hidden md:block">Daily Self-Mastery Tracker</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
