"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

interface AddProblemFormProps {
  onProblemAdded?: () => void;
}

export default function AddProblemForm({
  onProblemAdded,
}: AddProblemFormProps) {
  const [problemNumber, setProblemNumber] = useState("");
  const [problemName, setProblemName] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!problemNumber || !problemName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // First, get the existing problem if it exists
      const { data: existingProblems, error: searchError } = await supabase
        .from("problems")
        .select("*")
        .eq("user_id", user.id)
        .eq("number", parseInt(problemNumber));

      if (searchError) {
        throw searchError;
      }

      if (existingProblems && existingProblems.length > 0) {
        const existingProblem = existingProblems[0];

        // Perform a raw update using SQL
        const { error: updateError } = await supabase.rpc(
          "increment_problem_solved",
          {
            problem_id: existingProblem.id,
            user_id_input: user.id,
            new_difficulty: difficulty,
            new_name: problemName,
          }
        );

        if (updateError) {
          throw updateError;
        }

        toast({
          title: "Success",
          description: `Problem updated! Solved ${
            existingProblem.times_solved + 1
          } times.`,
        });
      } else {
        // Insert new problem
        const { error: insertError } = await supabase.from("problems").insert({
          user_id: user.id,
          number: parseInt(problemNumber),
          name: problemName,
          difficulty,
          date_solved: new Date().toISOString(),
          times_solved: 1,
        });

        if (insertError) {
          throw insertError;
        }

        toast({
          title: "Success",
          description: "Problem added successfully!",
        });
      }

      // Reset form
      setProblemNumber("");
      setProblemName("");
      setDifficulty("Easy");

      // Trigger refresh
      if (onProblemAdded) {
        onProblemAdded();
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: (error instanceof Error) ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProblemNumberChange = async (value: string) => {
    setProblemNumber(value);
    if (value) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: existingProblems } = await supabase
            .from("problems")
            .select("name, difficulty, times_solved")
            .eq("user_id", user.id)
            .eq("number", parseInt(value))
            .limit(1);

          if (existingProblems && existingProblems.length > 0) {
            setProblemName(existingProblems[0].name);
            setDifficulty(existingProblems[0].difficulty);
          } else {
            setProblemName("");
          }
        }
      } catch (error: unknown) { // Cast to unknown
        console.error("Error:", error);
      }
    } else {
      setProblemName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="problem-number">Problem Number</Label>
        <Input
          id="problem-number"
          type="number"
          placeholder="Enter problem number"
          value={problemNumber}
          onChange={(e) => handleProblemNumberChange(e.target.value)}
          required
          min="1"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="problem-name">Problem Name</Label>
        <Input
          id="problem-name"
          type="text"
          placeholder="Enter problem name"
          value={problemName}
          onChange={(e) => setProblemName(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label>Difficulty</Label>
        <RadioGroup
          value={difficulty}
          onValueChange={setDifficulty}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Easy" id="easy" />
            <Label htmlFor="easy" className="text-green-600 font-medium">
              Easy
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Medium" id="medium" />
            <Label htmlFor="medium" className="text-yellow-600 font-medium">
              Medium
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Hard" id="hard" />
            <Label htmlFor="hard" className="text-red-600 font-medium">
              Hard
            </Label>
          </div>
        </RadioGroup>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {loading ? "Adding Problem..." : "Add Problem"}
      </Button>
    </form>
  );
}
