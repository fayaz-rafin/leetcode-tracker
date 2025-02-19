// app/leaderboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Trophy, Flame, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";

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
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, currentPage]);

  async function fetchLeaderboard() {
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
  }

  const handleUserClick = (username: string) => {
    router.push(`/users/${username}`);
  };

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
      <main className="flex-1 py-6">
        <div className="container px-4 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-sm text-muted-foreground">
                See how you stack up against other members
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={leaderboardType === "problems" ? "default" : "outline"}
                onClick={() => {
                  setLeaderboardType("problems");
                  setCurrentPage(1);
                }}
              >
                <Hash className="h-4 w-4 mr-1" />
                Problems Solved
              </Button>
              <Button
                variant={leaderboardType === "streak" ? "default" : "outline"}
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

          <Card>
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
                        <div
                          key={user.id}
                          className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleUserClick(user.username)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleUserClick(user.username);
                          }}
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
                          <span className="flex-1 font-medium">
                            {user.username}
                          </span>
                          <span className="text-muted-foreground">
                            {leaderboardType === "problems"
                              ? `${user.total_problems} solved`
                              : `${user.current_streak} days`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between p-4 border-t">
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
const handleUserClick = (username: string) => {
  console.log("Navigating to user:", username); // Debug log
  router.push(`/users/${username}`);
};