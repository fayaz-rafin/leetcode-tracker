import Link from "next/link"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-lg">LeetCode Tracker</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#about">
            About
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">Log In</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Track Your LeetCode Progress
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Boost your coding interview preparation with our intuitive LeetCode problem tracking tool.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/signup">
                <Button>Sign Up</Button>
                </Link>

                <Link href="/auth/login">
                  <Button variant="outline">Log In</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">Features</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                <h3 className="text-xl font-bold mb-2">Problem Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Keep a record of all the LeetCode problems youve ever solved.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                <h3 className="text-xl font-bold mb-2">Progress Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Visualize your progress with detailed statistics and charts.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                <h3 className="text-xl font-bold mb-2">Difficulty Filtering</h3>
                <p className="text-gray-500 dark:text-gray-400">Sort and filter problems by difficulty level.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              About LeetCode Tracker
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 text-center">
              LeetCode Tracker is designed to help software engineers and coding enthusiasts prepare for technical
              interviews. By providing a comprehensive system to track your solved LeetCode problems, analyze your
              progress, and focus on areas that need improvement, we aim to boost your confidence and performance in
              coding interviews.
            </p>
          </div>
        </section>
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              About LeetCode Tracker
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 text-center">
              LeetCode Tracker is designed to help software engineers and coding enthusiasts prepare for technical
              interviews. By providing a comprehensive system to track your solved LeetCode problems, analyze your
              progress, and focus on areas that need improvement, we aim to boost your confidence and performance in
              coding interviews.
            </p>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 LeetCode Tracker. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

