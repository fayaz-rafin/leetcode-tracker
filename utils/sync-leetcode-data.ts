// utils/sync-leetcode-data.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { fetchAllLeetCodeProblems } from "@/lib/leetcode-api";

export async function syncLeetCodeData() {
  const supabase = createClientComponentClient();

  try {
    // Fetch all LeetCode problems
    const { data: leetcodeData } = await fetchAllLeetCodeProblems();
    const problems = leetcodeData.problemsetQuestionList.questions;

    // Get all problems from your database
    const { data: dbProblems, error } = await supabase
      .from("problems")
      .select("*");

    if (error) throw error;

    // Update each problem with LeetCode data
    for (const problem of dbProblems) {
      const leetcodeProblem = problems.find(
        (p: any) => parseInt(p.questionId) === problem.number
      );

      if (leetcodeProblem) {
        await supabase
          .from("problems")
          .update({
            leetcode_url: `https://leetcode.com/problems/${leetcodeProblem.titleSlug}`,
            problem_types: leetcodeProblem.topicTags.map(
              (tag: any) => tag.name
            ),
          })
          .eq("id", problem.id);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error syncing LeetCode data:", error);
    return { success: false, error };
  }
}
