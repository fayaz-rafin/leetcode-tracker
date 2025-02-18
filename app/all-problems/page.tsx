// app/all-problems/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

type Problem = {
  id: string;
  number: number;
  name: string;
  difficulty: string;
  date_solved: string;
  times_solved: number;
};

const PROBLEMS_PER_PAGE = 25;

export default function AllProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProblems, setTotalProblems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    number: "",
    name: "",
    difficulty: "all",
  });
  const supabase = createClientComponentClient();

  const fetchProblems = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      // Build query
      let query = supabase
        .from("problems")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("date_solved", { ascending: false });

      // Apply filters
      if (filters.number) {
        query = query.eq("number", parseInt(filters.number));
      }
      if (filters.name) {
        query = query.ilike("name", `%${filters.name}%`);
      }
      if (filters.difficulty !== "all") {
        query = query.eq("difficulty", filters.difficulty);
      }

      // Add pagination
      const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
      const end = start + PROBLEMS_PER_PAGE - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;
      setProblems(data || []);
      if (count !== null) setTotalProblems(count);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [filters, currentPage]);

  const totalPages = Math.ceil(totalProblems / PROBLEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">All Solved Problems</h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Filter by problem number"
              value={filters.number}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, number: e.target.value }));
                setCurrentPage(1);
              }}
              type="number"
            />
            <Input
              placeholder="Filter by problem name"
              value={filters.name}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, name: e.target.value }));
                setCurrentPage(1);
              }}
            />
            <Select
              value={filters.difficulty}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, difficulty: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
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
                  <TableHead className="w-[150px]">Difficulty</TableHead>
                  <TableHead className="w-[120px]">Times Solved</TableHead>
                  <TableHead className="w-[150px]">Last Solved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading problems...
                    </TableCell>
                  </TableRow>
                ) : problems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No problems found
                    </TableCell>
                  </TableRow>
                ) : (
                  problems.map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell>{problem.number}</TableCell>
                      <TableCell>{problem.name}</TableCell>
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
