// components/contribution-graph.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  format,
  eachDayOfInterval,
  subMonths,
  eachWeekOfInterval,
} from "date-fns";
import { useMediaQuery } from "@/hooks/use-media-query";

type ContributionDay = {
  date: Date;
  count: number;
};

export function ContributionGraph() {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchContributions();
  }, []);

  async function fetchContributions() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      const endDate = new Date();
      const startDate = subMonths(endDate, isMobile ? 2 : 5);

      const { data: problems, error } = await supabase
        .from("problems")
        .select("date_solved")
        .eq("user_id", user.id)
        .gte("date_solved", startDate.toISOString())
        .lte("date_solved", endDate.toISOString());

      if (error) throw error;

      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      const contributionMap = new Map<string, number>();

      allDays.forEach((day) => {
        contributionMap.set(format(day, "yyyy-MM-dd"), 0);
      });

      problems?.forEach((problem) => {
        const date = format(new Date(problem.date_solved), "yyyy-MM-dd");
        contributionMap.set(date, (contributionMap.get(date) || 0) + 1);
      });

      setContributions(
        Array.from(contributionMap.entries()).map(([dateStr, count]) => ({
          date: new Date(dateStr),
          count,
        }))
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const getColorForCount = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count <= 1) return "bg-green-100 dark:bg-green-900";
    if (count <= 3) return "bg-green-300 dark:bg-green-700";
    if (count <= 5) return "bg-green-500 dark:bg-green-500";
    return "bg-green-700 dark:bg-green-300";
  };

  const getContributionCount = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return (
      contributions.find((c) => format(c.date, "yyyy-MM-dd") === dateStr)
        ?.count || 0
    );
  };

  if (loading) {
    return <div className="animate-pulse h-[120px] bg-gray-200 rounded-md" />;
  }

  const endDate = new Date();
  const startDate = subMonths(endDate, isMobile ? 2 : 5);
  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 }
  );

  return (
    <div className="w-full space-y-2">
      {!isMobile && (
        // Desktop month labels
        <div className="grid grid-cols-6 pl-8">
          {Array.from(new Set(weeks.map((week) => format(week, "MMM")))).map(
            (month) => (
              <div key={month} className="text-xs text-muted-foreground">
                {month}
              </div>
            )
          )}
        </div>
      )}

      <div className="flex">
        {!isMobile && (
          // Desktop day labels
          <div className="flex flex-col justify-between pr-2 w-8">
            <span className="text-xs text-muted-foreground h-3">Mon</span>
            <span className="text-xs text-muted-foreground h-3">Wed</span>
            <span className="text-xs text-muted-foreground h-3">Fri</span>
          </div>
        )}

        {/* Contribution grid */}
        <div
          className={`grid grid-flow-col gap-1 flex-1 ${
            isMobile ? "px-1" : ""
          }`}
        >
          {weeks.map((week) => (
            <div key={week.toISOString()} className="grid grid-rows-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const day = new Date(week);
                day.setDate(day.getDate() + i);
                const count = getContributionCount(day);
                return (
                  <div
                    key={i}
                    className={`w-3 h-3 ${getColorForCount(count)} rounded-sm`}
                    title={`${count} contributions on ${format(
                      day,
                      "MMM d, yyyy"
                    )}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 4, 6].map((count) => (
          <div
            key={count}
            className={`w-3 h-3 rounded-sm ${getColorForCount(count)}`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
