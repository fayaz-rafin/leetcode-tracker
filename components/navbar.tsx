// components/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Menu, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profile);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg">
          LeetCode Tracker
        </Link>

        {!loading && user && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 ml-auto">
              <nav className="flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/all-problems" className="text-sm font-medium">
                  All Problems
                </Link>
                <Link href="/leaderboard" className="text-sm font-medium">
                  Leaderboard
                </Link>
              </nav>

              {/* Streak */}
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">
                  {profile?.current_streak || 0}
                </span>
              </div>

              {/* Avatar */}
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.username?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              {/* Logout */}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">
                  {profile?.current_streak || 0}
                </span>
              </div>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader className="border-b pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>
                          {profile?.username?.[0]?.toUpperCase() ||
                            user?.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {profile?.username || user?.email}
                        </span>
                        <Link
                          href="/profile"
                          className="text-xs text-muted-foreground hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/all-problems" onClick={() => setIsOpen(false)}>
                      All Problems
                    </Link>
                    <Link href="/leaderboard" onClick={() => setIsOpen(false)}>
                      Leaderboard
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
