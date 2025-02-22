// lib/leetcode-api.ts
const LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";

export async function fetchLeetCodeProblem(titleSlug: string) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        topicTags {
          name
          slug
        }
        content
        stats
        hints
        exampleTestcases
      }
    }
  `;

  const response = await fetch(LEETCODE_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { titleSlug },
    }),
  });

  return response.json();
}

// You can also get all problems list
export async function fetchAllLeetCodeProblems() {
  const query = `
    query problemsetQuestionList {
      problemsetQuestionList: questionList {
        questions: data {
          questionId
          title
          titleSlug
          difficulty
          topicTags {
            name
            slug
          }
        }
      }
    }
  `;

  const response = await fetch(LEETCODE_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  return response.json();
}
