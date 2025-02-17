import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type ProblemStats = {
  totalSolved: number;
  solvedThisWeek: number;
  currentStreak: number;
  streakMessage: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  averagePerDay: number;
  longestStreak: number;
};

export async function calculateProblemStats(): Promise<ProblemStats> {
  const supabase = createClientComponentClient();

  try {
    // Get all problems for the user
    const { data: problems, error } = await supabase
      .from("problems")
      .select("*")
      .order("date_solved", { ascending: false });

    if (error) throw error;

    if (!problems || problems.length === 0) {
      return {
        totalSolved: 0,
        solvedThisWeek: 0,
        currentStreak: 0,
        streakMessage: "Start your journey today!",
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        averagePerDay: 0,
        longestStreak: 0,
      };
    }

    // Calculate total solved
    const totalSolved = problems.length;

    // Calculate problems solved this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const solvedThisWeek = problems.filter(
      (problem) => new Date(problem.date_solved) > oneWeekAgo
    ).length;

    // Calculate average per day this week
    const averagePerDay = solvedThisWeek / 7;

    // Calculate difficulty distribution
    const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
    const mediumCount = problems.filter(
      (p) => p.difficulty === "Medium"
    ).length;
    const hardCount = problems.filter((p) => p.difficulty === "Hard").length;

    // Calculate streaks
    const dates = problems.map(
      (p) => new Date(p.date_solved).toISOString().split("T")[0]
    );
    const uniqueDates = [...new Set(dates)].sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Calculate current streak
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[uniqueDates.length - 1 - i]);
      date.setHours(0, 0, 0, 0);

      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (date.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // Get motivational message based on streak
    const streakMessage = getStreakMessage(currentStreak);

    return {
      totalSolved,
      solvedThisWeek,
      currentStreak,
      streakMessage,
      easyCount,
      mediumCount,
      hardCount,
      averagePerDay,
      longestStreak,
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
  if (streak >= 30 && streak < 50) return "30+ days! Ultimate dedication! 🏆";
  if (streak >= 50 && streak < 100) return "50+ days! You're in the zone! 🎯";
  if (streak >= 100) return "100+ days! Absolutely phenomenal! 🌟";
  return "Keep coding!";
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-green-600";
    case "medium":
      return "text-yellow-600";
    case "hard":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function getProgressColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-500";
    case "medium":
      return "bg-yellow-500";
    case "hard":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export function calculateCompletionRate(totalSolved: number): number {
  const totalLeetCodeProblems = 2500; // Update this number periodically
  return Math.round((totalSolved / totalLeetCodeProblems) * 100);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;

  const uniqueDates = [...new Set(dates)].sort();
  let streak = 1;

  for (let i = uniqueDates.length - 1; i > 0; i--) {
    const curr = new Date(uniqueDates[i]);
    const prev = new Date(uniqueDates[i - 1]);
    const diffDays = Math.floor(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
