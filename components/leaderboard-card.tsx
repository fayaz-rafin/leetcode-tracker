// components/leaderboard-card.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Trophy, Flame, Hash } from "lucide-react";
import { useCallback } from "react"; // Add useCallback import
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardUser = {
  id: string;
  username: string;
  avatar_url: string | null;
  total_problems: number;
  current_streak: number;
};

export function LeaderboardCard() {
  const [leaderboardType, setLeaderboardType] = useState<"problems" | "streak">(
    "problems"
  );
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      if (leaderboardType === "problems") {
        // First get all users with usernames
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, current_streak")
          .not("username", "is", null);

        if (profileError) throw profileError;

        // Then get problem counts for each user
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

        // Sort by total problems and get top 3
        const sortedUsers = userProblems
          .sort((a, b) => b.total_problems - a.total_problems)
          .slice(0, 3);

        setUsers(sortedUsers);
      } else {
        // Get users sorted by streak
        const { data: usersByStreak, error: streakError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, current_streak")
          .not("username", "is", null)
          .order("current_streak", { ascending: false })
          .limit(3);

        if (streakError) throw streakError;

        setUsers(
          usersByStreak?.map((user) => ({
            ...user,
            total_problems: 0,
          })) || []
        );
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, [leaderboardType, supabase]); // Add dependencies
; // Add semicolon here

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

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Top performers in the community</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={leaderboardType === "problems" ? "default" : "outline"}
              size="sm"
              onClick={() => setLeaderboardType("problems")}
              className="h-8"
            >
              <Hash className="h-4 w-4 mr-1" />
              Problems
            </Button>
            <Button
              variant={leaderboardType === "streak" ? "default" : "outline"}
              size="sm"
              onClick={() => setLeaderboardType("streak")}
              className="h-8"
            >
              <Flame className="h-4 w-4 mr-1" />
              Streak
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[50px] ml-auto" />
                </div>
              ))
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No users found
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-6">
                  {getTrophyIcon(index)}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium">
                  {user.username}
                </span>
                <span className="text-sm text-muted-foreground">
                  {leaderboardType === "problems"
                    ? `${user.total_problems} solved`
                    : `${user.current_streak} days`}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
