import type { Metadata } from "next"
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import localFont from "next/font/local"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "LeetCode Tracker",
  description: "Track your LeetCode progress",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If you need Supabase but don't need session yet, you can keep this
  // or remove it completely if not needed
  const supabase = createServerComponentClient({ cookies })
  
  // Since you're not using session, just get the auth session without destructuring
  await supabase.auth.getSession();
  
  // Alternative: remove completely if you're not using Supabase in this component

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
