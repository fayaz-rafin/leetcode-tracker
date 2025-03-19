// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AddProblemForm from "@/components/add-problem-form";
import RecentProblems from "@/components/recent-problems";
import { Navbar } from "@/components/navbar";
import { ContributionGraph } from "@/components/contribution-graph";
import { calculateProblemStats, type ProblemStats } from "@/lib/problem-stats";
import { LeaderboardCard } from "@/components/leaderboard-card";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProblemStats | null>(null);
  const [username, setUsername] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getMotivationalMessage = () => {
    if (!stats) return "Start your coding journey today!";

    if (stats.solvedToday) {
      return "Great work today! Keep the momentum going! 🚀";
    }

    if (stats.currentStreak > 5) {
      return `Impressive ${stats.currentStreak}-day streak! You're on fire! 🔥`;
    }

    if (stats.solvedThisWeek > 10) {
      return "You're crushing it this week! 💪";
    }

    return "Ready to tackle some problems? Let's go! 💻";
  };

  const loadStats = async () => {
    try {
      const stats = await calculateProblemStats();
      setStats(stats);
      setLastUpdated(new Date());
      setError(null);
    } catch (error) {
      console.error("Error loading stats:", error);
      setError("Failed to load statistics. Please try again later.");
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/auth/login");
          return;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        setUsername(profile?.username || user.email?.split("@")[0] || "Coder");

        await loadStats();

        // Set up real-time subscription
        const problemsSubscription = supabase
          .channel("problems-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "problems",
            },
            () => {
              loadStats();
            }
          )
          .subscribe();

        return () => {
          problemsSubscription.unsubscribe();
        };
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("An error occurred while loading the dashboard.");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {username}! 👋
            </h1>
            <p className="text-muted-foreground">{getMotivationalMessage()}</p>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Solved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalSolved || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.solvedThisWeek || 0} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.currentStreak || 0} days
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.streakMessage || "Start your streak today!"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(((stats?.totalSolved || 0) / 2500) * 100)}%
                </div>
                <Progress
                  value={((stats?.totalSolved || 0) / 2500) * 100}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Of total LeetCode problems
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Per Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalSolved
                    ? (stats.solvedThisWeek / 7).toFixed(1)
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Problems per day this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
            <CardContent className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium">Daily Goal</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.solvedToday || 0}/3
                  </p>
                  <Progress
                    value={((stats?.solvedToday || 0) / 3) * 100}
                    className="mt-2"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Weekly Target</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.solvedThisWeek || 0}/15
                  </p>
                  <Progress
                    value={((stats?.solvedThisWeek || 0) / 15) * 100}
                    className="mt-2"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Monthly Progress</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.solvedThisMonth || 0}/50
                  </p>
                  <Progress
                    value={((stats?.solvedThisMonth || 0) / 50) * 100}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity and Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contribution Activity</CardTitle>
                <CardDescription>
                  Your problem-solving activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContributionGraph />
              </CardContent>
            </Card>

            <LeaderboardCard />
          </div>

          {/* Recent Problems and Add Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Problems</CardTitle>
                <CardDescription>
                  Your recently solved LeetCode problems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentProblems onProblemAdded={loadStats} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Problem</CardTitle>
                <CardDescription>Record your latest conquest</CardDescription>
              </CardHeader>
              <CardContent>
                <AddProblemForm onProblemAdded={loadStats} />
              </CardContent>
            </Card>
          </div>

          {/* Problem Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Distribution</CardTitle>
              <CardDescription>Breakdown by difficulty level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Easy</span>
                    <span>{stats?.easyCount || 0} problems</span>
                  </div>
                  <Progress
                    value={
                      ((stats?.easyCount || 0) / (stats?.totalSolved || 1)) *
                      100
                    }
                    className="bg-green-100 h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600 font-medium">Medium</span>
                    <span>{stats?.mediumCount || 0} problems</span>
                  </div>
                  <Progress
                    value={
                      ((stats?.mediumCount || 0) / (stats?.totalSolved || 1)) *
                      100
                    }
                    className="bg-yellow-100 h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600 font-medium">Hard</span>
                    <span>{stats?.hardCount || 0} problems</span>
                  </div>
                  <Progress
                    value={
                      ((stats?.hardCount || 0) / (stats?.totalSolved || 1)) *
                      100
                    }
                    className="bg-red-100 h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
