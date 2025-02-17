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

type Problem = {
  id: string;
  number: number;
  name: string;
  difficulty: string;
  date_solved: string;
};

export default function AllProblemsTable() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("date_solved", { ascending: false });

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
  }, []);

  if (loading) {
    return <div>Loading problems...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Date Solved</TableHead>
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
            <TableCell>
              {new Date(problem.date_solved).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
