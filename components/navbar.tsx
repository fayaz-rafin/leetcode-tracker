"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Braces, Flame, Menu, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase";
import { DEV_AUTH_BYPASS } from "@/lib/dev-mode";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/all-problems", label: "Problems" },
  { href: "/leaderboard", label: "Ranks" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string | undefined } | null>(null);
  const [profile, setProfile] = useState<{ current_streak: number; avatar_url: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const getUser = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      setUser({ id: user.id, email: user.email });
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (error) {
      console.error("Navbar user error:", error);
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void getUser();
  }, [getUser]);

  const handleLogout = async () => {
    if (DEV_AUTH_BYPASS) {
      router.push("/");
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (error: unknown) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 md:px-8">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="LeetTrack dashboard">
          <span className="grid h-9 w-9 place-items-center border-2 border-foreground bg-accent shadow-[2px_2px_0_0_var(--ink)]">
            <Braces className="h-4 w-4" />
          </span>
          <span className="hidden font-mono text-sm font-black uppercase sm:block">Leet<span className="text-destructive">Track</span></span>
        </Link>

        {!loading && user && (
          <>
            <nav className="ml-4 hidden h-full items-stretch md:flex" aria-label="Application navigation">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center px-4 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto hidden items-center gap-3 md:flex">
              {DEV_AUTH_BYPASS && <span className="retro-chip bg-secondary">local demo</span>}
              <span className="flex h-9 items-center gap-1.5 border-2 border-foreground bg-[var(--sun)] px-3 font-mono text-xs font-black" title="Current streak">
                <Flame className="h-4 w-4" /> {profile?.current_streak || 0}
              </span>
              <Button asChild size="sm" className="bg-destructive text-destructive-foreground">
                <Link href="/dashboard#log-solution"><Plus /> Log solution</Link>
              </Button>
              <Link href="/profile" aria-label="Open profile">
                <Avatar className="h-10 w-10 border-2 border-foreground">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-secondary font-mono font-black">
                    {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-2 md:hidden">
              <span className="flex h-9 items-center gap-1 border-2 border-foreground bg-[var(--sun)] px-2 font-mono text-xs font-black"><Flame className="h-4 w-4" />{profile?.current_streak || 0}</span>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open navigation"><Menu /></Button>
                </SheetTrigger>
                <SheetContent side="right" className="border-l-2 border-foreground bg-card p-5">
                  <SheetTitle className="sr-only">Application navigation</SheetTitle>
                  <div className="flex items-center gap-3 border-b-2 border-foreground pb-5">
                    <Avatar className="h-11 w-11 border-2 border-foreground">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || "P"}</AvatarFallback>
                    </Avatar>
                    <div><p className="font-mono text-sm font-black">{profile?.username || user.email}</p><p className="text-xs text-muted-foreground">player profile</p></div>
                  </div>
                  <nav className="mt-5 grid gap-2">
                    {links.map((link, index) => (
                      <Link key={link.href} href={link.href} className="border-b border-foreground/20 py-3 font-mono font-bold" onClick={() => setIsOpen(false)}>
                        0{index + 1} / {link.label}
                      </Link>
                    ))}
                    <Button asChild className="mt-3 bg-destructive text-destructive-foreground"><Link href="/dashboard#log-solution" onClick={() => setIsOpen(false)}><Plus /> Log solution</Link></Button>
                    <Button variant="outline" className="mt-2" onClick={() => { void handleLogout(); setIsOpen(false); }}>{DEV_AUTH_BYPASS ? "Exit demo" : "Log out"}</Button>
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
