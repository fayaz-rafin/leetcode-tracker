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

    try {
      setLoading(true);
      console.log("Attempting to add problem...");

      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Validate inputs
      if (!problemNumber || !problemName || !difficulty) {
        throw new Error("Please fill in all fields");
      }

      // Insert the problem
      const { error: insertError } = await supabase.from("problems").insert({
        user_id: user.id,
        number: parseInt(problemNumber),
        name: problemName,
        difficulty,
        date_solved: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(insertError.message);
      }

      console.log("Problem added successfully");

      toast({
        title: "Success",
        description: "Problem added successfully!",
      });

      // Reset form
      setProblemNumber("");
      setProblemName("");
      setDifficulty("Easy");

      // Trigger refresh of problems list and stats
      if (onProblemAdded) {
        onProblemAdded();
      }
    } catch (error: any) {
      console.error("Error adding problem:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add problem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          onChange={(e) => setProblemNumber(e.target.value)}
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
