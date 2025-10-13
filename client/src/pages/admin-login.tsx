import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("adminAuth", "true");
        sessionStorage.setItem("adminUser", JSON.stringify(data.admin));
        toast({
          title: "✅ Login Successful",
          description: "Welcome to the admin panel",
        });
        setLocation("/kb-admin-007");
      } else {
        toast({
          title: "❌ Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0e1a 50%, #000000 100%)'
      }}
      data-testid="admin-login-page"
    >
      <Card 
        className="w-full max-w-md p-8"
        style={{
          background: 'rgba(15, 20, 35, 0.95)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.1)'
        }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center" 
               style={{background: '#ffd700'}}>
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{color: '#ffd700'}}>
            Admin Portal
          </h1>
          <p className="text-gray-400">Secure access to control panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#ffd700'}}>
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="pl-10"
                required
                data-testid="input-admin-username"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#ffd700'}}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pl-10"
                required
                data-testid="input-admin-password"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="button-admin-login"
            style={{
              background: '#ffd700',
              color: '#000',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? "Logging in..." : "Login to Admin Panel"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation('/')}
            className="text-sm text-gray-400 hover:text-[#ffd700] transition-colors"
            data-testid="link-back-home"
          >
            ← Back to Home
          </button>
        </div>
      </Card>
    </div>
  );
}
