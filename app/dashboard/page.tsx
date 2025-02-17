import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Toaster } from "@/components/ui/toaster"
import AddProblemForm from "@/components/add-problem-form"
import RecentProblems from "@/components/recent-problems"
import { Navbar } from "@/components/navbar"

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="flex flex-col gap-4 md:gap-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">+2 from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7 days</div>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">68%</div>
                    <Progress value={68} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">143 hours</div>
                    <p className="text-xs text-muted-foreground">Across all problems</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 md:col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Problems</CardTitle>
                    <CardDescription>Your recently solved LeetCode problems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentProblems />
                  </CardContent>
                </Card>
                <Card className="col-span-2 md:col-span-1">
                  <CardHeader>
                    <CardTitle>Add New Problem</CardTitle>
                    <CardDescription>Record your latest conquest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AddProblemForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Toaster />
    </div>
  )
}

