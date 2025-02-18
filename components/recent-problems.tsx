// components/recent-problems.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Badge } from "@/components/ui/badge";

type Problem = {
  id: string;
  number: number;
  name: string;
  difficulty: string;
  date_solved: string;
  times_solved: number;
};

interface RecentProblemsProps {
  onProblemAdded?: () => void;
}

export default function RecentProblems({
  onProblemAdded,
}: RecentProblemsProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchProblems = async () => {
    try {
      // First get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      // Then fetch only their problems
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("user_id", user.id) // Add this filter for current user
        .order("date_solved", { ascending: false })
        .limit(5);

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

  useEffect(() => {
    const fetchChannel = async () => {
      const channel = supabase
        .channel("problems_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "problems",
            filter: `user_id=eq.${(await supabase.auth.getUser()).data.user?.id}`, // Add filter for real-time updates
          },
          () => {
            fetchProblems();
            if (onProblemAdded) {
              onProblemAdded();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchChannel();
  }, [supabase, onProblemAdded]);

  if (loading) {
    return <div>Loading recent problems...</div>;
  }

  return (
    <div className="space-y-8">
      {problems.length === 0 ? (
        <p className="text-sm text-muted-foreground">No problems solved yet.</p>
      ) : (
        problems.map((problem) => (
          <div key={problem.id} className="flex items-center">
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
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {problem.number}. {problem.name}
                {problem.times_solved > 1 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Solved {problem.times_solved} times)
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Last solved on{" "}
                {new Date(problem.date_solved).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
