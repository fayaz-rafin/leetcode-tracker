// app/leaderboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Trophy, Flame, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/navbar";

type LeaderboardUser = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  problems: {
    count: number;
  }[];
  current_streak: number;
};

const USERS_PER_PAGE = 20;

export default function LeaderboardPage() {
  const [leaderboardType, setLeaderboardType] = useState<"problems" | "streak">(
    "problems"
  );
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, page]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const offset = (page - 1) * USERS_PER_PAGE;

      if (leaderboardType === "problems") {
        const { data, error, count } = await supabase
          .from("profiles")
          .select(
            `
            id,
            username,
            avatar_url,
            bio,
            problems:problems(count),
            current_streak
          `,
            { count: "exact" }
          )
          .order("problems", { ascending: false })
          .range(offset, offset + USERS_PER_PAGE - 1);

        if (error) throw error;
        setUsers(data || []);
        if (count) setTotalUsers(count);
      } else {
        const { data, error, count } = await supabase
          .from("profiles")
          .select(
            `
            id,
            username,
            avatar_url,
            bio,
            problems:problems(count),
            current_streak
          `,
            { count: "exact" }
          )
          .order("current_streak", { ascending: false })
          .range(offset, offset + USERS_PER_PAGE - 1);

        if (error) throw error;
        setUsers(data || []);
        if (count) setTotalUsers(count);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-6 md:py-12">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Leaderboard</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                See how you stack up against other members
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={leaderboardType === "problems" ? "default" : "outline"}
                size="sm"
                className="h-8 md:h-9"
                onClick={() => {
                  setLeaderboardType("problems");
                  setPage(1);
                }}
              >
                <Hash className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Problems</span>
                <span className="md:hidden">Solved</span>
              </Button>
              <Button
                variant={leaderboardType === "streak" ? "default" : "outline"}
                size="sm"
                className="h-8 md:h-9"
                onClick={() => {
                  setLeaderboardType("streak");
                  setPage(1);
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
                <div className="space-y-4 p-4">
                  {Array(USERS_PER_PAGE)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="divide-y">
                  {users.map((user, index) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 md:w-10">
                        {index === 0 && (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        )}
                        {index === 1 && (
                          <Trophy className="h-5 w-5 text-gray-400" />
                        )}
                        {index === 2 && (
                          <Trophy className="h-5 w-5 text-amber-600" />
                        )}
                        {index > 2 && (
                          <span className="text-sm md:text-base text-muted-foreground">
                            {index + 1 + (page - 1) * USERS_PER_PAGE}
                          </span>
                        )}
                      </div>
                      <Avatar className="h-8 w-8 md:h-10 md:w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.username?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm md:text-base truncate">
                          {user.username}
                        </div>
                        {user.bio && (
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                      <div className="text-sm md:text-base text-muted-foreground shrink-0">
                        {leaderboardType === "problems"
                          ? `${user.problems?.[0]?.count || 0} solved`
                          : `${user.current_streak || 0} days`}
                      </div>
                    </Link>
                  ))}
                  {users.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      No users found
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-t">
                <p className="text-sm text-muted-foreground order-2 md:order-1 text-center md:text-left">
                  Showing {(page - 1) * USERS_PER_PAGE + 1} to{" "}
                  {Math.min(page * USERS_PER_PAGE, totalUsers)} of {totalUsers}{" "}
                  users
                </p>
                <div className="flex justify-center gap-2 order-1 md:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 md:h-9"
                  >
                    <ChevronLeft className="h-4 w-4 md:mr-1" />
                    <span className="hidden md:inline">Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 md:h-9"
                  >
                    <span className="hidden md:inline">Next</span>
                    <ChevronRight className="h-4 w-4 md:ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
