// app/all-problems/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Add this import
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import { toast } from "@/hooks/use-toast";

interface Problem {
  id: string;
  number: number;
  name: string;
  difficulty: string;
  date_solved: string;
  times_solved: number;
  leetcode_url?: string;
  problem_types?: string[];
}

interface LeetCodeProblem {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  topicTags: { name: string; slug: string }[];
}

const PROBLEMS_PER_PAGE = 25;
const LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";

// Helper function to generate LeetCode URL
const generateLeetCodeUrl = (name: string) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return `https://leetcode.com/problems/${slug}`;
};

async function fetchLeetCodeProblems() {
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data.data.problemsetQuestionList.questions;
}

export default function AllProblemsPage() {
  const router = useRouter(); // Add this line to initialize the router
  const [problems, setProblems] = useState<Problem[]>([]);
  const [leetcodeProblems, setLeetcodeProblems] = useState<LeetCodeProblem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [totalProblems, setTotalProblems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    number: "",
    name: "",
    difficulty: "all",
    type: "all",
  });
  const [problemTypes, setProblemTypes] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLeetCodeData();
  }, []);

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      let query = supabase
        .from("problems")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("date_solved", { ascending: false });

      if (filters.number) {
        query = query.eq("number", parseInt(filters.number));
      }
      if (filters.name) {
        query = query.ilike("name", `%${filters.name}%`);
      }
      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }
      if (filters.type !== "all") {
        query = query.contains("problem_types", [filters.type]);
      }

      const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
      const end = start + PROBLEMS_PER_PAGE - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      // Enhance problems with LeetCode URLs
      const enhancedProblems =
        data?.map((problem) => ({
          ...problem,
          leetcode_url:
            problem.leetcode_url || generateLeetCodeUrl(problem.name),
        })) || [];

      setProblems(enhancedProblems);
      if (count !== null) setTotalProblems(count);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load problems",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, filters, currentPage, router]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  async function fetchLeetCodeData() {
    try {
      const problems = await fetchLeetCodeProblems();
      setLeetcodeProblems(problems);

      const types = new Set<string>();
      problems.forEach((problem: LeetCodeProblem) => {
        problem.topicTags.forEach((tag) => types.add(tag.name));
      });
      setProblemTypes(Array.from(types).sort());
    } catch (error) {
      console.error("Error fetching LeetCode data:", error);
    }
  }

  async function syncWithLeetCode() {
    if (!leetcodeProblems.length) return;

    try {
      setSyncing(true);
      const { data: dbProblems, error } = await supabase
        .from("problems")
        .select("*");

      if (error) throw error;

      for (const problem of dbProblems) {
        const leetcodeProblem = leetcodeProblems.find(
          (p) => parseInt(p.questionId) === problem.number
        );

        if (leetcodeProblem) {
          await supabase
            .from("problems")
            .update({
              leetcode_url: `https://leetcode.com/problems/${leetcodeProblem.titleSlug}`,
              problem_types: leetcodeProblem.topicTags.map((tag) => tag.name),
            })
            .eq("id", problem.id);
        }
      }

      toast({
        title: "Success",
        description: "Successfully synced with LeetCode data",
      });

      fetchProblems();
    } catch (error) {
      console.error("Error syncing:", error);
      toast({
        title: "Error",
        description: "Failed to sync with LeetCode data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }

  const handleProblemClick = (problem: Problem) => {
    if (typeof window !== "undefined" && problem.leetcode_url) {
      window.open(
        problem.leetcode_url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Solved Problems</h1>
            <Button
              onClick={syncWithLeetCode}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync with LeetCode"}
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Problem number"
              value={filters.number}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, number: e.target.value }))
              }
              type="number"
            />
            <Input
              placeholder="Problem name"
              value={filters.name}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Select
              value={filters.difficulty}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Problem type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {problemTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Problems Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[120px]">Difficulty</TableHead>
                  <TableHead>Types</TableHead>
                  <TableHead className="w-[100px]">Times Solved</TableHead>
                  <TableHead className="w-[150px]">Last Solved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading problems...
                    </TableCell>
                  </TableRow>
                ) : problems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No problems found
                    </TableCell>
                  </TableRow>
                ) : (
                  problems.map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell>{problem.number}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleProblemClick(problem)}
                          className="flex items-center gap-2 hover:text-primary text-left w-full"
                        >
                          {problem.name}
                          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            problem.difficulty === "Easy"
                              ? "secondary"
                              : problem.difficulty === "Medium"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {problem.problem_types?.map((type) => (
                            <Badge
                              key={type}
                              variant="outline"
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{problem.times_solved}</TableCell>
                      <TableCell>
                        {new Date(problem.date_solved).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && problems.length > 0 && (
            <div className="flex items-center justify-between mt-4 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * PROBLEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * PROBLEMS_PER_PAGE, totalProblems)} of{" "}
                {totalProblems} problems
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={
                    currentPage === Math.ceil(totalProblems / PROBLEMS_PER_PAGE)
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
