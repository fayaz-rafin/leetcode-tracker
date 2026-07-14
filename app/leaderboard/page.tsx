// app/leaderboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { DEV_USER } from "@/lib/dev-mode";
import { Trophy, Flame, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback } from "react"; // Add useCallback import

type LeaderboardUser = {
  id: string;
  username: string;
  avatar_url: string | null;
  total_problems: number;
  current_streak: number;
};

const USERS_PER_PAGE = 20;

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboardType, setLeaderboardType] = useState<"problems" | "streak">(
    "problems"
  );
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const supabase = createClient();

  // Define fetchLeaderboard function
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      if (leaderboardType === "problems") {
        // Get all users with usernames
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, current_streak")
          .not("username", "is", null);

        if (profileError) throw profileError;

        // Get problem counts for each user
        const userProblems = await Promise.all(
          profiles.map(async (profile) => {
            const { data, error } = await supabase
              .from("problems")
              .select("number", { count: "exact", head: false })
              .eq("user_id", profile.id)
              .limit(1000);

            if (error) throw error;

            return {
              ...profile,
              total_problems: data?.length || 0,
            };
          })
        );

        // Sort by total problems
        const sortedUsers = userProblems.sort(
          (a, b) => b.total_problems - a.total_problems
        );
        setTotalUsers(sortedUsers.length);

        // Get current page of users
        const startIndex = (currentPage - 1) * USERS_PER_PAGE;
        const endIndex = startIndex + USERS_PER_PAGE;
        setUsers(sortedUsers.slice(startIndex, endIndex));
      } else {
        // Get users sorted by streak
        const {
          data: usersByStreak,
          count,
          error: streakError,
        } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, current_streak", {
            count: "exact",
          })
          .not("username", "is", null)
          .order("current_streak", { ascending: false })
          .range(
            (currentPage - 1) * USERS_PER_PAGE,
            currentPage * USERS_PER_PAGE - 1
          );

        if (streakError) throw streakError;

        setUsers(
          usersByStreak?.map((user) => ({
            ...user,
            total_problems: 0,
          })) || []
        );

        if (count) setTotalUsers(count);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, [leaderboardType, currentPage, supabase]); // Add supabase to dependencies

  // Fix useEffect dependency
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleUserClick = useCallback((username: string) => {
    console.log("Navigating to user:", username); // Debug log
    router.push(`/users/${username}`);
  }, [router]);

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  const getTrophyIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="retro-page">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col justify-between gap-5 border-b-2 border-foreground pb-8 md:flex-row md:items-end">
            <div>
              <div className="retro-kicker">Campus rankings / season 01</div>
              <h1 className="text-4xl font-black md:text-6xl">High scores</h1>
              <p className="mt-3 text-muted-foreground">
                Friendly competition for people who keep showing up.
              </p>
            </div>
            <div className="flex border-2 border-foreground bg-card p-1 shadow-[3px_3px_0_0_var(--ink)]">
              <Button
                variant={leaderboardType === "problems" ? "default" : "ghost"}
                className="border-0 shadow-none"
                aria-pressed={leaderboardType === "problems"}
                onClick={() => {
                  setLeaderboardType("problems");
                  setCurrentPage(1);
                }}
              >
                <Hash className="h-4 w-4 mr-1" />
                Problems Solved
              </Button>
              <Button
                variant={leaderboardType === "streak" ? "default" : "ghost"}
                className="border-0 shadow-none"
                aria-pressed={leaderboardType === "streak"}
                onClick={() => {
                  setLeaderboardType("streak");
                  setCurrentPage(1);
                }}
              >
                <Flame className="h-4 w-4 mr-1" />
                Streak
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-[4rem_1fr_auto] border-b-2 border-foreground bg-primary px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary-foreground">
              <span>Rank</span><span>Player</span><span>Score</span>
            </div>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-4">
                  {Array(USERS_PER_PAGE)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-2 animate-pulse"
                      >
                        <Skeleton className="w-8 h-4" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="flex-1 h-4" />
                        <Skeleton className="w-20 h-4" />
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {users.map((user, index) => {
                      const globalIndex =
                        (currentPage - 1) * USERS_PER_PAGE + index;
                      return (
                        <button
                          type="button"
                          key={user.id}
                          className={`flex w-full min-w-0 items-center gap-3 border-b border-foreground/20 p-4 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring sm:gap-4 ${user.id === DEV_USER.id ? "bg-secondary" : ""}`}
                          onClick={() => handleUserClick(user.username)}
                        >
                          <div className="w-8 text-center">
                            {globalIndex <= 2 ? (
                              getTrophyIcon(globalIndex)
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {globalIndex + 1}
                              </span>
                            )}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              {user.username?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {user.username}{user.id === DEV_USER.id && <span className="ml-2 font-mono text-[10px] font-black uppercase text-destructive">you</span>}
                          </span>
                          <span className="shrink-0 text-right text-sm text-muted-foreground">
                            {leaderboardType === "problems"
                              ? `${user.total_problems} solved`
                              : `${user.current_streak} days`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * USERS_PER_PAGE + 1} to{" "}
                      {Math.min(currentPage * USERS_PER_PAGE, totalUsers)} of{" "}
                      {totalUsers} users
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
