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
  const supabase = createClientComponentClient();

  const loadStats = async () => {
    try {
      const stats = await calculateProblemStats();
      setStats(stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/auth/login");
          return;
        }

        await loadStats();
      } catch (error) {
        console.error("Dashboard error:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="flex flex-col gap-4 md:gap-8">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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

                <Card className="col-span-2 md:col-span-1">
                  <LeaderboardCard />
                </Card>
              </div>

              {/* Contribution Graph */}
              <Card>
                <CardHeader>
                  <CardTitle>Leetcode Activity</CardTitle>
                  <CardDescription>
                    Your problem-solving activity over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContributionGraph />
                </CardContent>
              </Card>

              {/* Recent Problems and Add Problem Form */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 md:col-span-1">
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

                <Card className="col-span-2 md:col-span-1">
                  <CardHeader>
                    <CardTitle>Add New Problem</CardTitle>
                    <CardDescription>
                      Record your latest conquest
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AddProblemForm onProblemAdded={loadStats} />
                  </CardContent>
                </Card>
              </div>

              {/* Difficulty Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Problem Distribution</CardTitle>
                  <CardDescription>
                    Breakdown by difficulty level
                  </CardDescription>
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
                          ((stats?.easyCount || 0) /
                            (stats?.totalSolved || 1)) *
                          100
                        }
                        className="bg-green-100 h-2"
                      >
                        <div className="bg-green-500 h-2 rounded-full" />
                      </Progress>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-600 font-medium">
                          Medium
                        </span>
                        <span>{stats?.mediumCount || 0} problems</span>
                      </div>
                      <Progress
                        value={
                          ((stats?.mediumCount || 0) /
                            (stats?.totalSolved || 1)) *
                          100
                        }
                        className="bg-yellow-100 h-2"
                      >
                        <div className="bg-yellow-500 h-2 rounded-full" />
                      </Progress>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600 font-medium">Hard</span>
                        <span>{stats?.hardCount || 0} problems</span>
                      </div>
                      <Progress
                        value={
                          ((stats?.hardCount || 0) /
                            (stats?.totalSolved || 1)) *
                          100
                        }
                        className="bg-red-100 h-2"
                      >
                        <div className="bg-red-500 h-2 rounded-full" />
                      </Progress>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Toaster />
    </div>
  );
}
