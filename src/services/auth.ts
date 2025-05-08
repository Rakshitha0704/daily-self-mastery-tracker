
import { User } from "@/types";

// Mock user data
const USERS: Record<string, { password: string; user: User }> = {
  "student1": {
    password: "s1pass",
    user: { id: "student1", name: "Student 1", role: "student" }
  },
  "student2": {
    password: "s2pass",
    user: { id: "student2", name: "Student 2", role: "student" }
  },
  "mentor": {
    password: "mentorpass",
    user: { id: "mentor", name: "Mentor", role: "mentor" }
  }
};

// Store the current user in localStorage
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

export const login = (username: string, password: string): User | null => {
  const userRecord = USERS[username];
  
  if (userRecord && userRecord.password === password) {
    localStorage.setItem('currentUser', JSON.stringify(userRecord.user));
    return userRecord.user;
  }
  
  return null;
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
