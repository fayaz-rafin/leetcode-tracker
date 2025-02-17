"use client";

import { Navbar } from "@/components/navbar";
import AllProblemsTable from "@/components/all-problems-table";

export default function AllProblemsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">All Solved Problems</h1>
          <AllProblemsTable />
        </div>
      </main>
    </div>
  );
}
