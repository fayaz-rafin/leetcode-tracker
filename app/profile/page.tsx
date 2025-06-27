// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Loader2,
  Upload,
  Github,
  Linkedin,
  Code2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { useCallback } from "react"; // Add useCallback import

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  leetcode_handle: string | null;
  github_handle: string | null;
  linkedin_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [leetcodeHandle, setLeetcodeHandle] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClientComponentClient();

  // Important: Add this function to make the component properly handle the dependency
  // Place this right after your state declarations
  const getProfile = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      // Use const instead of let
      const { data: profileData, error: fetchError } = await supabase // Renamed error to fetchError
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError && fetchError.code === "PGRST116") { // Use fetchError
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
        setUsername(newProfile?.username || "");
        setBio(newProfile?.bio || "");
        setLeetcodeHandle(newProfile?.leetcode_handle || "");
        setGithubHandle(newProfile?.github_handle || "");
        setLinkedinUrl(newProfile?.linkedin_url || "");
      } else if (fetchError) { // Use fetchError
        throw fetchError;
      } else {
        setProfile(profileData);
        setUsername(profileData?.username || "");
        setBio(profileData?.bio || "");
        setLeetcodeHandle(profileData?.leetcode_handle || "");
        setGithubHandle(profileData?.github_handle || "");
        setLinkedinUrl(profileData?.linkedin_url || "");
      }
    } catch (error: unknown) { // Cast to unknown
      console.error("Error:", error);
      toast({
        title: "Error",
        description: (error as Error).message, // Cast to Error
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [router, supabase]); // Add router and supabase to dependencies

  // Fix useEffect dependency
  useEffect(() => {
    getProfile();
  }, [getProfile]); // Add getProfile to dependency array

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .not("id", "eq", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existingUser) {
        toast({
          title: "Error",
          description: "Username already taken",
          variant: "destructive",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Username set successfully!",
      });

      await getProfile();
    } catch (error: unknown) { // Cast to unknown
      toast({
        title: "Error",
        description: (error as Error).message, // Cast to Error
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Fix the any types in handleProfileUpdate
  async function handleProfileUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      const updates = {
        bio,
        leetcode_handle: leetcodeHandle,
        github_handle: githubHandle,
        linkedin_url: linkedinUrl,
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      await getProfile();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message, // Cast to Error
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile?.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });

      await getProfile();
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Information Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <Label>Profile Picture</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile?.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span>
                          {uploading ? "Uploading..." : "Upload new avatar"}
                        </span>
                      </div>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={uploading}
                      />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recommended: Square image, 500x500px or larger
                    </p>
                  </div>
                </div>
              </div>

              {/* Username Section */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <form onSubmit={handleUsernameSubmit} className="space-y-2">
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={profile?.username !== null}
                  />
                  {profile?.username === null && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Choose your username carefully - it cannot be changed
                        later
                      </p>
                      <Button type="submit" disabled={!username.trim()}>
                        Set Username
                      </Button>
                    </>
                  )}
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Bio & Social Links Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Bio & Social Links</CardTitle>
              <CardDescription>Tell others about yourself</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Bio Section */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    className="resize-none h-32"
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {bio.length}/300 characters
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-1">
                    <div className="space-y-2">
                      <Label
                        htmlFor="leetcode"
                        className="flex items-center gap-2"
                      >
                        <Code2 className="h-4 w-4" />
                        LeetCode Handle
                      </Label>
                      <Input
                        id="leetcode"
                        placeholder="your_leetcode_handle"
                        value={leetcodeHandle}
                        onChange={(e) => setLeetcodeHandle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="github"
                        className="flex items-center gap-2"
                      >
                        <Github className="h-4 w-4" />
                        GitHub Handle
                      </Label>
                      <Input
                        id="github"
                        placeholder="your_github_handle"
                        value={githubHandle}
                        onChange={(e) => setGithubHandle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="linkedin"
                        className="flex items-center gap-2"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn URL
                      </Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/your-profile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </form>

              {/* Social Links Preview */}
              {(leetcodeHandle || githubHandle || linkedinUrl) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium mb-4">
                    Your Social Links
                  </h3>
                  <div className="flex gap-4">
                    {leetcodeHandle && (
                      <a
                        href={`https://leetcode.com/${leetcodeHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Code2 className="h-5 w-5" />
                      </a>
                    )}
                    {githubHandle && (
                      <a
                        href={`https://github.com/${githubHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
