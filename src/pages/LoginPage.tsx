
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = login(username, password);
      
      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mastery-light via-white to-mastery-light/50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-mastery-accent/20 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-xl mb-4 bg-gradient-to-br from-mastery-primary to-mastery-secondary flex items-center justify-center text-white font-heading text-2xl">
              SM
            </div>
            <CardTitle className="text-2xl font-bold">Self Mastery</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-mastery-primary to-mastery-secondary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t border-border p-4">
            <div className="text-sm text-center w-full text-muted-foreground">
              <p className="mb-2">Demo Accounts:</p>
              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="text-xs p-1 border border-border rounded">
                  student1 / s1pass
                </div>
                <div className="text-xs p-1 border border-border rounded">
                  student2 / s2pass
                </div>
                <div className="text-xs p-1 border border-border rounded">
                  mentor / mentorpass
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
