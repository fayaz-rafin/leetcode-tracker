// app/auth/signup/page.tsx
"use client";

import { useState } from "react";
// Remove router import since it's not being used
// import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  // Remove unused router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      setConfirmationEmail(email);
      toast({
        title: "Check your email",
        description:
          "We've sent you a confirmation link. Please check your email.",
      });

      // Show confirmation message instead of redirecting
      setEmail("");
      setPassword("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message, // Cast to Error
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Start from checkpoint zero" title="Create your save file." description="Your solve history, streak, and weak patterns—all in one focused workspace.">
          {confirmationEmail ? (
            <div className="border-2 border-foreground bg-accent p-5 shadow-[4px_4px_0_0_var(--ink)]" role="status">
              <div className="font-mono text-xs font-black uppercase tracking-[0.16em]">Checkpoint created</div>
              <h2 className="mt-2 text-2xl font-black">Check your inbox.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent the confirmation link to <strong className="text-foreground">{confirmationEmail}</strong>. Open it to activate your account.
              </p>
              <Button variant="outline" className="mt-5" onClick={() => setConfirmationEmail(null)}>
                Use another email
              </Button>
            </div>
          ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
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
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full bg-destructive text-destructive-foreground" disabled={loading}>
              {loading ? "Creating save..." : "Create account"}
            </Button>
          </form>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold underline decoration-2 underline-offset-4">
              Load your save file
            </Link>
          </div>
    </AuthShell>
  );
}
