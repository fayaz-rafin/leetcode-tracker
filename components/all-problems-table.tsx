// components/all-problems-table.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Problem = {
  id: string;
  number: number;
  name: string;
  difficulty: string;
  date_solved: string;
  times_solved: number;
};

export default function AllProblemsTable() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    number: "",
    name: "",
    difficulty: "all",
  });
  const supabase = createClientComponentClient();

  const fetchProblems = async () => {
    try {
      let query = supabase
        .from("problems")
        .select("*")
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

      const { data, error } = await query;

      if (error) throw error;

      setProblems(data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  if (loading) {
    return <div>Loading problems...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Filter by problem number"
            value={filters.number}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, number: e.target.value }))
            }
            type="number"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Filter by problem name"
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="w-[200px]">
          <Select
            value={filters.difficulty}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, difficulty: value }))
            }
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
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Times Solved</TableHead>
            <TableHead>Last Solved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
