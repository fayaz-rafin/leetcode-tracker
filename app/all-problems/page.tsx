"use client"

import { useState } from "react"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navbar } from "@/components/navbar"

// Mock data for LeetCode problems
const initialProblems = [
  { id: 1, number: 1, name: "Two Sum", difficulty: "Easy", dateSolved: "2023-06-15" },
  { id: 2, number: 2, name: "Add Two Numbers", difficulty: "Medium", dateSolved: "2023-06-14" },
  {
    id: 3,
    number: 3,
    name: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    dateSolved: "2023-06-13",
  },
  { id: 4, number: 4, name: "Median of Two Sorted Arrays", difficulty: "Hard", dateSolved: "2023-06-12" },
  { id: 5, number: 5, name: "Longest Palindromic Substring", difficulty: "Medium", dateSolved: "2023-06-11" },
  { id: 6, number: 20, name: "Valid Parentheses", difficulty: "Easy", dateSolved: "2023-06-10" },
  { id: 7, number: 53, name: "Maximum Subarray", difficulty: "Medium", dateSolved: "2023-06-09" },
  { id: 8, number: 121, name: "Best Time to Buy and Sell Stock", difficulty: "Easy", dateSolved: "2023-06-08" },
  { id: 9, number: 217, name: "Contains Duplicate", difficulty: "Easy", dateSolved: "2023-06-07" },
  { id: 10, number: 238, name: "Product of Array Except Self", difficulty: "Medium", dateSolved: "2023-06-06" },
]

type Problem = {
  id: number
  number: number
  name: string
  difficulty: string
  dateSolved: string
}

type SortKey = "number" | "name" | "difficulty" | "dateSolved"

export default function AllProblems() {
  const [problems, setProblems] = useState<Problem[]>(initialProblems)
  const [filter, setFilter] = useState("All")
  const [sortKey, setSortKey] = useState<SortKey>("number")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")

  const handleFilter = (difficulty: string) => {
    setFilter(difficulty)
    const filtered =
      difficulty === "All" ? initialProblems : initialProblems.filter((problem) => problem.difficulty === difficulty)
    setProblems(filtered)
  }

  const handleSort = (key: SortKey) => {
    const isAsc = sortKey === key && sortOrder === "asc"
    setSortKey(key)
    setSortOrder(isAsc ? "desc" : "asc")
    const sorted = [...problems].sort((a, b) => {
      if (a[key] < b[key]) return isAsc ? 1 : -1
      if (a[key] > b[key]) return isAsc ? -1 : 1
      return 0
    })
    setProblems(sorted)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    const filtered = initialProblems.filter(
      (problem) =>
        problem.name.toLowerCase().includes(value.toLowerCase()) || problem.number.toString().includes(value),
    )
    setProblems(filtered)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">All Solved Problems</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input placeholder="Search problems..." value={search} onChange={(e) => handleSearch(e.target.value)} />
            </div>
            <Select value={filter} onValueChange={handleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button variant="ghost" onClick={() => handleSort("number")}>
                      Number
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("name")}>
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("difficulty")}>
                      Difficulty
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort("dateSolved")}>
                      Date Solved
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell className="font-medium">{problem.number}</TableCell>
                    <TableCell>{problem.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${
                          problem.difficulty === "Easy"
                            ? "bg-green-100 text-green-800"
                            : problem.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{problem.dateSolved}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}

