
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ActivitySquare, CalendarDays, BarChart3, CheckSquare, Settings } from "lucide-react";
import { getCurrentUser } from "@/services/auth";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  role?: "student" | "mentor" | "both";
};

export default function NavMenu() {
  const location = useLocation();
  const currentUser = getCurrentUser();
  
  const navItems: NavItem[] = [
    {
      label: "Daily Tasks",
      href: "/",
      icon: <CheckSquare className="h-5 w-5" />,
      role: "both",
    },
    {
      label: "Weekly View",
      href: "/weekly",
      icon: <CalendarDays className="h-5 w-5" />,
      role: "both",
    },
    {
      label: "Progress Dashboard",
      href: "/progress",
      icon: <BarChart3 className="h-5 w-5" />,
      role: "both",
    },
    {
      label: "Activity Report",
      href: "/report",
      icon: <ActivitySquare className="h-5 w-5" />,
      role: "both",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      role: "both",
    },
  ];

  return (
    <div className="space-y-1 px-2">
      {navItems
        .filter(item => item.role === "both" || item.role === currentUser?.role)
        .map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors",
              location.pathname === item.href
                ? "bg-mastery-accent/20 text-mastery-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
    </div>
  );
}
