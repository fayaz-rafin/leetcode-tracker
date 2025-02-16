import { Badge } from "@/components/ui/badge"

const problems = [
  { id: 1, name: "Two Sum", difficulty: "Easy", date: "2023-06-15" },
  { id: 2, name: "Add Two Numbers", difficulty: "Medium", date: "2023-06-14" },
  { id: 3, name: "Longest Substring Without Repeating Characters", difficulty: "Medium", date: "2023-06-13" },
  { id: 4, name: "Median of Two Sorted Arrays", difficulty: "Hard", date: "2023-06-12" },
  { id: 5, name: "Longest Palindromic Substring", difficulty: "Medium", date: "2023-06-11" },
]

export default function RecentProblems() {
  return (
    <div className="space-y-8">
      {problems.map((problem) => (
        <div key={problem.id} className="flex items-center">
          <Badge
            variant={
              problem.difficulty === "Easy" ? "secondary" : problem.difficulty === "Medium" ? "default" : "destructive"
            }
          >
            {problem.difficulty}
          </Badge>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{problem.name}</p>
            <p className="text-sm text-muted-foreground">Solved on {new Date(problem.date).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

