// app/users/[username]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Flame,
  ArrowLeft,
  Code2,
  Github,
  Linkedin,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  leetcode_handle: string | null;
  github_handle: string | null;
  linkedin_url: string | null;
  current_streak: number;
}

interface Problem {
  id: string;
  user_id: string;
  number: string;
  name: string;
  difficulty: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!username) return;

    async function fetchUserProfile() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError("User not found");
          setLoading(false);
          return;
        }

        // Fetch user's problems
        const { data: problemsData, error: problemsError } = await supabase
          .from("problems")
          .select("id, number, name, difficulty")
          .eq("user_id", profileData.id);

        if (problemsError) {
          setError(problemsError.message);
          setLoading(false);
          return;
        }

        setProfile(profileData);
        setProblems(problemsData || []);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("An error occurred while loading the profile");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [username, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">
              Error Loading Profile
            </h2>
            <p className="text-muted-foreground mb-4">
              {error || "Could not load user profile"}
            </p>
            <Button onClick={() => router.push("/leaderboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-6">
        <div className="container max-w-4xl mx-auto px-4 space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/leaderboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leaderboard
          </Button>

          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">
                    {profile.username}
                  </h1>
                  <div className="flex gap-4">
                    {profile.leetcode_handle && (
                      <a
                        href={`https://leetcode.com/${profile.leetcode_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Code2 className="h-5 w-5" />
                      </a>
                    )}
                    {profile.github_handle && (
                      <a
                        href={`https://github.com/${profile.github_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Problems Solved
                    </p>
                    <p className="text-2xl font-bold">{problems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Flame className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Streak
                    </p>
                    <p className="text-2xl font-bold">
                      {profile.current_streak || 0} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Problems Table */}
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Solved Problems</CardTitle>
              <CardDescription>
                Problems solved by {profile.username}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                {problems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Difficulty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {problems.map((problem) => (
                        <TableRow key={problem.id}>
                          <TableCell>{problem.number}</TableCell>
                          <TableCell>{problem.name}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                problem.difficulty === "Easy"
                                  ? "bg-green-100 text-green-700"
                                  : problem.difficulty === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No problems solved yet
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
