"use client"

import { useEffect, useState } from "react"
import { Trophy, Medal, Clock, Star, Zap, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LeaderboardPageProps {
  currentTeamId?: string
  onGoToAdmin: () => void
}

interface LeaderboardEntry {
  rank: number
  team_id: string
  team_name: string
  score: number
  total_correct: number
  completion_time: number
  round2_status: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function LeaderboardPage({ currentTeamId, onGoToAdmin }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          // Add rank numbers
          const ranked = (data.leaderboard || []).map(
            (entry: any, index: number) => ({
              ...entry,
              rank: index + 1,
            })
          )
          setLeaderboard(ranked)
        }
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load leaderboard.")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)
  const currentTeam = leaderboard.find((t) => t.team_id === currentTeamId)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — NO admin panel button, participants can't access it */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Leaderboard</h1>
              <p className="text-xs text-muted-foreground">Round 1 Results</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {leaderboard.length} team{leaderboard.length !== 1 ? "s" : ""} completed
            </span>
            <button
              onClick={onGoToAdmin}
              className="text-muted-foreground/20 hover:text-muted-foreground/50 transition-colors text-base"
              title="Admin"
            >
              ⚙
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">

        {/* Top 3 Podium — only show if at least 3 teams finished */}
        {topThree.length === 3 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {/* 2nd place */}
            <div className="flex flex-col items-center mt-6">
              <div className="w-14 h-14 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center mb-2">
                <Medal className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground mt-0.5 text-center">
                {topThree[1].team_name}
              </span>
              <Badge variant="secondary" className="mt-1.5 text-xs">
                {topThree[1].total_correct}/30
              </Badge>
              <div className="w-full h-20 bg-secondary/50 rounded-t-xl mt-3 border border-b-0 border-border/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">2</span>
              </div>
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-2">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground mt-0.5 text-center">
                {topThree[0].team_name}
              </span>
              <Badge className="mt-1.5 text-xs bg-primary text-primary-foreground">
                {topThree[0].total_correct}/30
              </Badge>
              <div className="w-full h-28 bg-primary/10 rounded-t-xl mt-3 border border-b-0 border-primary/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center mt-10">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center mb-2">
                <Medal className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground mt-0.5 text-center">
                {topThree[2].team_name}
              </span>
              <Badge variant="secondary" className="mt-1.5 text-xs">
                {topThree[2].total_correct}/30
              </Badge>
              <div className="w-full h-14 bg-secondary/30 rounded-t-xl mt-3 border border-b-0 border-border/20 flex items-center justify-center">
                <span className="text-xl font-bold text-muted-foreground">3</span>
              </div>
            </div>
          </div>
        )}

        {/* Your Result Card */}
        {currentTeam && (
          <Card className="border-primary/20 bg-primary/5 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 border border-primary/30">
                    <span className="text-sm font-bold text-primary">#{currentTeam.rank}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{currentTeam.team_name}</span>
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">You</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-lg font-bold text-primary">{currentTeam.total_correct}/30</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Clock className="w-3 h-3" />
                      {formatTime(currentTeam.completion_time)}
                    </div>
                  </div>
                  {currentTeam.round2_status && (
                    <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Qualified
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Rankings */}
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Full Rankings</CardTitle>
              <span className="text-xs text-muted-foreground">{leaderboard.length} teams</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leaderboard.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground text-sm">
                No teams have completed the quiz yet.
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-[3rem_1fr_5rem_5rem_6rem] gap-2 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/30">
                    <span>Rank</span>
                    <span>Team</span>
                    <span className="text-right">Score</span>
                    <span className="text-right">Time</span>
                    <span className="text-right">Status</span>
                  </div>

                  {leaderboard.map((team) => {
                    const isCurrentTeam = team.team_id === currentTeamId
                    return (
                      <div
                        key={team.team_id}
                        className={`grid grid-cols-[3rem_1fr_5rem_5rem_6rem] gap-2 py-3 items-center border-b border-border/20 last:border-0 text-sm transition-colors ${
                          isCurrentTeam ? "bg-primary/5 -mx-4 px-4 rounded-lg" : ""
                        }`}
                      >
                        <span className={`font-bold ${team.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                          #{team.rank}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className={`font-medium truncate ${isCurrentTeam ? "text-primary" : "text-foreground"}`}>
                            {team.team_name}
                          </span>
                        </div>
                        <span className="text-right font-semibold text-foreground">
                          {team.total_correct}/30
                        </span>
                        <span className="text-right text-muted-foreground font-mono text-xs">
                          {formatTime(team.completion_time)}
                        </span>
                        <span className="text-right">
                          {team.round2_status ? (
                            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-1.5">
                              Round 2
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}