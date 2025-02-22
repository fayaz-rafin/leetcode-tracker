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
  Users,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface FollowStats {
  followers: number;
  following: number;
}

interface FollowUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

function FollowList({
  users,
  title,
  onUserClick,
  isLoading = false,
}: {
  users: FollowUser[];
  title: string;
  onUserClick: (username: string) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{title}</h3>
      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
              onClick={() => onUserClick(user.username)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.username}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No users found
        </p>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!username) return;
    
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user?.id || null);

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

        setProfile(profileData);

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

        setProblems(problemsData || []);

        // Check follow status
        if (user) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', profileData.id)
            .single();

          setIsFollowing(!!followData);
        }

        // Fetch follow stats
        const { data: followersData } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', profileData.id);

        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', profileData.id);

        setFollowStats({
          followers: followersData?.length || 0,
          following: followingData?.length || 0,
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while loading the profile");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [username, supabase]);

  async function fetchFollowers() {
    try {
      setLoadingFollowers(true);
      // First get the follower IDs
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', profile?.id);

      if (followError) {
        console.error('Error fetching followers:', followError);
        return;
      }

      if (!followData?.length) {
        setFollowers([]);
        return;
      }

      // Then get the profile information for those followers
      const followerIds = followData.map(f => f.follower_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followerIds);

      if (profilesError) {
        console.error('Error fetching follower profiles:', profilesError);
        return;
      }

      setFollowers(profilesData || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  }

  async function fetchFollowing() {
    try {
      setLoadingFollowing(true);
      // First get the following IDs
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', profile?.id);

      if (followError) {
        console.error('Error fetching following:', followError);
        return;
      }

      if (!followData?.length) {
        setFollowing([]);
        return;
      }

      // Then get the profile information for those being followed
      const followingIds = followData.map(f => f.following_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followingIds);

      if (profilesError) {
        console.error('Error fetching following profiles:', profilesError);
        return;
      }

      setFollowing(profilesData || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  }

  async function handleFollow() {
    try {
      if (!currentUser || !profile) return;

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser)
          .eq('following_id', profile.id);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: currentUser, following_id: profile.id });
      }

      setIsFollowing(!isFollowing);
      setFollowStats(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }));
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  }

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
            <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
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
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{profile.username}</h1>
                    {currentUser && currentUser !== profile.id && (
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        onClick={handleFollow}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-6 mb-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-sm"
                          onClick={fetchFollowers}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {followStats.followers} {followStats.followers === 1 ? 'follower' : 'followers'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Followers</DialogTitle>
                        </DialogHeader>
                        <FollowList
                          users={followers}
                          title="People following you"
                          onUserClick={(username) => {
                            router.push(`/users/${username}`);
                          }}
                          isLoading={loadingFollowers}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-sm"
                          onClick={fetchFollowing}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {followStats.following} following
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Following</DialogTitle>
                        </DialogHeader>
                        <FollowList
                          users={following}
                          title="People you follow"
                          onUserClick={(username) => {
                            router.push(`/users/${username}`);
                          }}
                          isLoading={loadingFollowing}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

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