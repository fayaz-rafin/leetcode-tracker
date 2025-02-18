// components/leaderboard-card.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Trophy, Flame, Hash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

type LeaderboardUser = {
  id: string
  username: string
  avatar_url: string | null
  problems: { count: number }[]
  current_streak: number
}

export function LeaderboardCard() {
  const [leaderboardType, setLeaderboardType] = useState<'problems' | 'streak'>('problems')
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchLeaderboard()
  }, [leaderboardType])

  async function fetchLeaderboard() {
    try {
      setLoading(true)
      
      if (leaderboardType === 'problems') {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            avatar_url,
            problems:problems(count),
            current_streak
          `)
          .not('username', 'is', null)
          .order('problems', { ascending: false })
          .limit(5)

        if (error) throw error
        setUsers(data || [])
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            avatar_url,
            problems:problems(count),
            current_streak
          `)
          .not('username', 'is', null)
          .order('current_streak', { ascending: false })
          .limit(5)

        if (error) throw error
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-[400px]">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-2">
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top performers in the community</CardDescription>
          <div className="flex gap-2 pt-2">
            <Button
              variant={leaderboardType === 'problems' ? "default" : "outline"}
              size="sm"
              onClick={() => setLeaderboardType('problems')}
              className="h-8"
            >
              <Hash className="h-4 w-4 mr-1" />
              Problems
            </Button>
            <Button
              variant={leaderboardType === 'streak' ? "default" : "outline"}
              size="sm"
              onClick={() => setLeaderboardType('streak')}
              className="h-8"
            >
              <Flame className="h-4 w-4 mr-1" />
              Streak
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[50px] ml-auto" />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No users found
            </div>
          ) : (
            users.map((user, index) => (
              <Link 
                key={user.id} 
                href={`/users/${user.id}`}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-6">
                  {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                  {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                  {index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
                  {index > 2 && <span className="text-sm text-muted-foreground">{index + 1}</span>}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium">{user.username}</span>
                <span className="text-sm text-muted-foreground">
                  {leaderboardType === 'problems' 
                    ? `${user.problems?.[0]?.count || 0} solved`
                    : `${user.current_streak || 0} days`
                  }
                </span>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}