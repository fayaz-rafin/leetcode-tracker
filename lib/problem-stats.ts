// lib/problem-stats.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type ProblemStats = {
  totalSolved: number;
  solvedThisWeek: number;
  currentStreak: number;
  streakMessage: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
};

export async function calculateProblemStats(): Promise<ProblemStats> {
  const supabase = createClientComponentClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    // Get user profile for streak
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    // Get all problems for the user
    const { data: problems, error } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id)
      .order("date_solved", { ascending: false });

    if (error) throw error;

    if (!problems) {
      return {
        totalSolved: 0,
        solvedThisWeek: 0,
        currentStreak: profile?.current_streak || 0,
        streakMessage: getStreakMessage(profile?.current_streak || 0),
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
      };
    }

    // Calculate total solved (counting unique problems)
    const uniqueProblems = new Set(problems.map((p) => p.number));
    const totalSolved = uniqueProblems.size;

    // Calculate problems solved this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const solvedThisWeek = problems.filter(
      (problem) => new Date(problem.date_solved) > oneWeekAgo
    ).length;

    // Calculate difficulty counts
    const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
    const mediumCount = problems.filter(
      (p) => p.difficulty === "Medium"
    ).length;
    const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

    return {
      totalSolved,
      solvedThisWeek,
      currentStreak: profile?.current_streak || 0,
      streakMessage: getStreakMessage(profile?.current_streak || 0),
      easyCount,
      mediumCount,
      hardCount,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    throw error;
  }
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your journey today!";
  if (streak === 1) return "Great start! Keep going!";
  if (streak === 2) return "Two days and counting!";
  if (streak === 3) return "Three days strong! 💪";
  if (streak === 4) return "Four days! You're on fire! 🔥";
  if (streak === 5) return "Five days! Incredible dedication!";
  if (streak === 6) return "Six days! Almost a week! ⭐";
  if (streak === 7) return "A full week! You're unstoppable! 🚀";
  if (streak > 7 && streak < 14) return "Amazing streak! Keep it up! 🌟";
  if (streak >= 14 && streak < 21)
    return "Two weeks+! You're a coding machine! 🤖";
  if (streak >= 21 && streak < 30) return "Three weeks+! Legendary status! 👑";
  if (streak >= 30) return "30+ days! Ultimate dedication! 🏆";
  return "Keep coding!";
}
