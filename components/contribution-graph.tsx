"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, eachDayOfInterval, subDays, startOfDay } from "date-fns";

type ContributionDay = {
  date: string;
  count: number;
};

export function ContributionGraph() {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchContributions = async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, 365);

      const { data, error } = await supabase
        .from("problems")
        .select("date_solved")
        .gte("date_solved", startDate.toISOString())
        .lte("date_solved", endDate.toISOString());

      if (error) {
        console.error("Error fetching contributions:", error);
        return;
      }

      // Create array of all days in range
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });

      // Count problems per day
      const contributionMap = new Map<string, number>();

      // Initialize all days with 0
      allDays.forEach((day) => {
        contributionMap.set(format(day, "yyyy-MM-dd"), 0);
      });

      // Count problems for each day
      data.forEach((problem) => {
        const date = format(new Date(problem.date_solved), "yyyy-MM-dd");
        contributionMap.set(date, (contributionMap.get(date) || 0) + 1);
      });

      const contributionArray = Array.from(contributionMap.entries()).map(
        ([date, count]) => ({
          date,
          count,
        })
      );

      setContributions(contributionArray);
    };

    fetchContributions();
  }, [supabase]);

  const getColorForCount = (count: number) => {
    if (count === 0) return "bg-gray-100";
    if (count <= 1) return "bg-green-100";
    if (count <= 3) return "bg-green-300";
    if (count <= 5) return "bg-green-500";
    return "bg-green-700";
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-sm font-medium mb-4">Days you leetcoded</h3>
      <div className="grid grid-cols-53 gap-1">
        {contributions.map((day) => (
          <div
            key={day.date}
            className={`w-3 h-3 rounded-sm ${getColorForCount(day.count)}`}
            title={`${day.count} problems on ${day.date}`}
          />
        ))}
      </div>
    </div>
  );
}
