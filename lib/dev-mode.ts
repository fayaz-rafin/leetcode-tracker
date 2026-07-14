export const DEV_AUTH_BYPASS =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_LOCAL_AUTH_BYPASS === "true";

export const DEV_USER = {
  id: "local-dev-user",
  email: "player1@localhost.dev",
  username: "player_one",
  currentStreak: 12,
};

export const DEV_STATS = {
  totalSolved: 147,
  easyCount: 63,
  mediumCount: 68,
  hardCount: 16,
  currentStreak: DEV_USER.currentStreak,
  solvedToday: 2,
  solvedThisWeek: 11,
  solvedThisMonth: 38,
  streakMessage: "Personal best: 12 days",
};

export const DEV_PROBLEMS = [
  {
    id: "dev-1",
    number: 1,
    name: "Two Sum",
    difficulty: "Easy",
    date_solved: "2026-07-13T18:30:00.000Z",
    times_solved: 3,
    leetcode_url: "https://leetcode.com/problems/two-sum",
    problem_types: ["Array", "Hash Table"],
  },
  {
    id: "dev-2",
    number: 146,
    name: "LRU Cache",
    difficulty: "Medium",
    date_solved: "2026-07-12T19:10:00.000Z",
    times_solved: 2,
    leetcode_url: "https://leetcode.com/problems/lru-cache",
    problem_types: ["Design", "Linked List"],
  },
  {
    id: "dev-3",
    number: 42,
    name: "Trapping Rain Water",
    difficulty: "Hard",
    date_solved: "2026-07-10T21:05:00.000Z",
    times_solved: 1,
    leetcode_url: "https://leetcode.com/problems/trapping-rain-water",
    problem_types: ["Two Pointers", "Stack"],
  },
  {
    id: "dev-4",
    number: 206,
    name: "Reverse Linked List",
    difficulty: "Easy",
    date_solved: "2026-07-08T16:45:00.000Z",
    times_solved: 4,
    leetcode_url: "https://leetcode.com/problems/reverse-linked-list",
    problem_types: ["Linked List", "Recursion"],
  },
  {
    id: "dev-5",
    number: 200,
    name: "Number of Islands",
    difficulty: "Medium",
    date_solved: "2026-07-06T14:20:00.000Z",
    times_solved: 2,
    leetcode_url: "https://leetcode.com/problems/number-of-islands",
    problem_types: ["Graph", "BFS"],
  },
] as const;

export const DEV_LEADERBOARD = [
  { id: "dev-a", username: "bit_wizard", avatar_url: null, total_problems: 312, current_streak: 21 },
  { id: "dev-b", username: "stack_sprinter", avatar_url: null, total_problems: 264, current_streak: 17 },
  { id: DEV_USER.id, username: DEV_USER.username, avatar_url: null, total_problems: DEV_STATS.totalSolved, current_streak: DEV_STATS.currentStreak },
  { id: "dev-d", username: "queue_t", avatar_url: null, total_problems: 133, current_streak: 8 },
  { id: "dev-e", username: "recursion_ron", avatar_url: null, total_problems: 118, current_streak: 5 },
] as const;
