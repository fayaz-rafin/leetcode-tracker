"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Flame, Plus, Target, Trophy } from "lucide-react";

import { createClient } from "@/lib/supabase";
import { DEV_AUTH_BYPASS, DEV_STATS, DEV_USER } from "@/lib/dev-mode";
import { calculateProblemStats, type ProblemStats } from "@/lib/problem-stats";
import { Navbar } from "@/components/navbar";
import AddProblemForm from "@/components/add-problem-form";
import RecentProblems from "@/components/recent-problems";
import { ContributionGraph } from "@/components/contribution-graph";
import { LeaderboardCard } from "@/components/leaderboard-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(!DEV_AUTH_BYPASS);
  const [stats, setStats] = useState<ProblemStats | null>(DEV_AUTH_BYPASS ? DEV_STATS : null);
  const [username, setUsername] = useState(DEV_AUTH_BYPASS ? DEV_USER.username : "");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadStats = async () => {
    try {
      const nextStats = DEV_AUTH_BYPASS ? DEV_STATS : await calculateProblemStats();
      setStats(nextStats);
      setLastUpdated(new Date());
      setError(null);
    } catch (loadError) {
      console.error("Stats error:", loadError);
      setError("Could not load your latest stats. Try refreshing the run.");
    }
  };

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel> | undefined;

    const checkUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push("/auth/login");
          return;
        }

        const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        setUsername(profile?.username || user.email?.split("@")[0] || DEV_USER.username);
        await loadStats();

        if (!DEV_AUTH_BYPASS) {
          subscription = supabase
            .channel("problems-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "problems" }, () => void loadStats())
            .subscribe();
        }
      } catch (dashboardError) {
        console.error("Dashboard error:", dashboardError);
        if (!DEV_AUTH_BYPASS) router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    void checkUser();
    return () => {
      if (subscription) void subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="retro-panel bg-accent px-8 py-6 font-mono text-sm font-black uppercase tracking-widest">Loading save file<span className="animate-pulse">_</span></div>
      </div>
    );
  }

  const solved = stats?.totalSolved || 0;
  const dailyPercent = Math.min(((stats?.solvedToday || 0) / 3) * 100, 100);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="retro-page">
        <div className="retro-container space-y-10">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          <section className="grid gap-6 border-b-2 border-foreground pb-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="retro-kicker">Player dashboard / run active</div>
              <h1 className="text-4xl font-black leading-none md:text-6xl">
                Hey, <span className="relative inline-block"><span className="absolute inset-x-0 bottom-0 h-3 bg-accent" aria-hidden="true" /><span className="relative">{username}</span></span>.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Your streak is alive. Finish today&apos;s quest and keep the momentum moving.
              </p>
              <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synced {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-destructive text-destructive-foreground md:hidden"><Plus /> Log solution</Button>
              </DialogTrigger>
              <DialogContent id="log-solution" className="border-2 border-foreground bg-card shadow-[7px_7px_0_0_var(--ink)] sm:max-w-lg">
                <DialogHeader><div className="retro-kicker">New checkpoint</div><DialogTitle className="text-3xl font-black">Log a solution</DialogTitle></DialogHeader>
                <AddProblemForm onProblemAdded={loadStats} />
              </DialogContent>
            </Dialog>
          </section>

          <section className="retro-panel grid overflow-hidden md:grid-cols-4" aria-label="Current statistics">
            {[
              { label: "Total solved", value: solved, note: `+${stats?.solvedThisWeek || 0} this week`, colour: "bg-accent" },
              { label: "Current streak", value: `${stats?.currentStreak || 0}d`, note: stats?.streakMessage || "Start today", colour: "bg-[var(--sun)]" },
              { label: "This month", value: stats?.solvedThisMonth || 0, note: "of 50 target", colour: "bg-secondary" },
              { label: "Hard clears", value: stats?.hardCount || 0, note: "boss levels beaten", colour: "bg-[var(--coral)] text-white" },
            ].map((metric, index) => (
              <div key={metric.label} className={`${metric.colour} p-5 ${index < 3 ? "border-b-2 md:border-b-0 md:border-r-2" : ""} border-foreground`}>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]">{metric.label}</p>
                <p className="mt-2 font-mono text-4xl font-black leading-none md:text-5xl">{metric.value}</p>
                <p className="mt-2 text-xs font-semibold opacity-75">{metric.note}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <Card className="overflow-hidden bg-primary text-primary-foreground">
              <CardHeader className="border-b-2 border-[var(--paper)]/30">
                <div className="flex items-center justify-between"><div><div className="retro-kicker text-primary-foreground before:text-[var(--coral)]">Today&apos;s quest</div><CardTitle className="text-3xl">Three clean solves</CardTitle></div><Target className="h-10 w-10 text-[var(--lime)]" /></div>
                <CardDescription className="text-primary-foreground/65">Quality reps beat random grinding.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-end justify-between"><span className="font-mono text-5xl font-black">{stats?.solvedToday || 0}<span className="text-xl text-primary-foreground/50">/3</span></span><span className="font-mono text-xs font-bold uppercase tracking-widest">{dailyPercent >= 100 ? "quest clear" : "in progress"}</span></div>
                <Progress value={dailyPercent} className="mt-5 h-4 border border-[var(--paper)]/50 bg-white/10" />
                <div className="mt-6 grid gap-2 font-mono text-xs">
                  <p className="flex items-center justify-between border-b border-white/15 pb-2"><span>◆ warm-up</span><span className="text-[var(--lime)]">cleared</span></p>
                  <p className="flex items-center justify-between border-b border-white/15 pb-2"><span>▲ core pattern</span><span className="text-[var(--lime)]">cleared</span></p>
                  <p className="flex items-center justify-between"><span>■ stretch problem</span><span className="text-[var(--sun)]">next</span></p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0"><div><div className="retro-kicker">Commit history</div><CardTitle className="text-2xl">Practice activity</CardTitle><CardDescription>Every square is a solved problem.</CardDescription></div><span className="retro-chip bg-accent"><Flame /> {stats?.currentStreak || 0} days</span></CardHeader>
              <CardContent><ContributionGraph /></CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-end justify-between space-y-0"><div><div className="retro-kicker">Latest checkpoints</div><CardTitle className="text-2xl">Recent solutions</CardTitle></div><Button asChild variant="link"><a href="/all-problems">Open ledger <ArrowRight /></a></Button></CardHeader>
              <CardContent><RecentProblems onProblemAdded={loadStats} /></CardContent>
            </Card>
            <LeaderboardCard />
          </section>

          <section className="retro-panel grid overflow-hidden md:grid-cols-[0.65fr_1.35fr]">
            <div className="bg-secondary p-6 md:p-8"><div className="retro-kicker">Build balance</div><h2 className="text-3xl font-black">Difficulty mix</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">A healthy run mixes confidence builders with harder pattern work.</p><Trophy className="mt-8 h-12 w-12" /></div>
            <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
              {[
                ["◆ Easy", stats?.easyCount || 0, "bg-[#1f7a55]"],
                ["▲ Medium", stats?.mediumCount || 0, "bg-[#9a5b00]"],
                ["■ Hard", stats?.hardCount || 0, "bg-[#b93846]"],
              ].map(([label, count, colour]) => (
                <div key={String(label)}><div className="flex items-center justify-between font-mono text-xs font-black uppercase"><span>{label}</span><span>{count}</span></div><div className="mt-3 h-4 border-2 border-foreground bg-muted"><div className={`h-full ${colour}`} style={{ width: `${(Number(count) / Math.max(solved, 1)) * 100}%` }} /></div></div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
