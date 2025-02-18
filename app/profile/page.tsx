// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Loader2,
  Upload,
  Github,
  Linkedin,
  Code2,
  ExternalLink,
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
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";

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

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      let { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist yet, create it
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        profile = newProfile;
      } else if (error) {
        throw error;
      }

      setProfile(profile);
      setUsername(profile?.username || "");
      setBio(profile?.bio || "");
      setLeetcodeHandle(profile?.leetcode_handle || "");
      setGithubHandle(profile?.github_handle || "");
      setLinkedinUrl(profile?.linkedin_url || "");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

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

      // Check if username exists
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update the profile with the new avatar URL
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
    } catch (error: any) {
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="space-y-4">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <span className="text-3xl">
                            {profile?.username?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
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
                      <p className="text-sm text-muted-foreground mt-1">
                        Recommended: Square image, 500x500px or larger
                      </p>
                    </div>
                  </div>
                </div>

                {/* Username Section */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={profile?.username !== null}
                  />
                  {profile?.username === null && (
                    <p className="text-sm text-muted-foreground">
                      Choose your username carefully - it cannot be changed
                      later
                    </p>
                  )}
                  {profile?.username === null && (
                    <Button
                      onClick={handleUsernameSubmit}
                      disabled={loading}
                      className="mt-2"
                    >
                      {loading ? "Saving..." : "Set Username"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bio & Social Links Card */}
            <Card>
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
                      className="resize-none"
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground text-right">
                      {bio.length}/300 characters
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
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

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
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
        </div>
      </main>
    </div>
  );
}
