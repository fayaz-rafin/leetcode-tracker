"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
//import { toast } from "@/components/ui/use-toast"

export default function AddProblemForm() {
  const [problemName, setProblemName] = useState("")
  const [difficulty, setDifficulty] = useState("Easy")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend or state management solution
    console.log("Problem added:", { problemName, difficulty })
    toast({
      title: "Problem Added",
      description: `${problemName} (${difficulty}) has been added to your solved problems.`,
    })
    setProblemName("")
    setDifficulty("Easy")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="problem-name">Problem Name</Label>
        <Input
          id="problem-name"
          placeholder="Enter problem name"
          value={problemName}
          onChange={(e) => setProblemName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Difficulty</Label>
        <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Easy" id="easy" />
            <Label htmlFor="easy">Easy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Medium" id="medium" />
            <Label htmlFor="medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Hard" id="hard" />
            <Label htmlFor="hard">Hard</Label>
          </div>
        </RadioGroup>
      </div>
      <Button type="submit" className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Problem
      </Button>
    </form>
  )
}

