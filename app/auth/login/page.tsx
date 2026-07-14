"use client";

import { useState } from "react";
// Remove the unused router import if not using it
// import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  // Remove the unused router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      // Force a hard navigation to the dashboard
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: (error as Error).message, // Cast to Error instead of AuthError
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Continue your run" title="Load save file." description="Sign in and pick up exactly where your last practice session ended.">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-destructive text-destructive-foreground" disabled={loading}>
              {loading ? "Loading save..." : "Log in"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-bold underline decoration-2 underline-offset-4">
              Create a save file
            </Link>
          </div>
    </AuthShell>
  );
}
