"use client"

import { Trophy, Medal, Clock, Star, ArrowRight, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LeaderboardPageProps {
  onGoToAdmin: () => void
  currentTeamId?: string
}

const MOCK_LEADERBOARD = [
  { rank: 1, teamId: "T05", teamName: "Binary Blazers", score: 28, timeTaken: "12:34", qualified: true },
  { rank: 2, teamId: "T12", teamName: "Code Crusaders", score: 27, timeTaken: "14:20", qualified: true },
  { rank: 3, teamId: "T01", teamName: "Pixel Pirates", score: 27, timeTaken: "16:45", qualified: true },
  { rank: 4, teamId: "T08", teamName: "Stack Overflow", score: 26, timeTaken: "11:55", qualified: true },
  { rank: 5, teamId: "T03", teamName: "Debug Dynasty", score: 25, timeTaken: "15:30", qualified: true },
  { rank: 6, teamId: "T15", teamName: "Syntax Squad", score: 24, timeTaken: "13:22", qualified: true },
  { rank: 7, teamId: "T07", teamName: "Bit Bandits", score: 24, timeTaken: "17:10", qualified: true },
  { rank: 8, teamId: "T20", teamName: "Hash Hunters", score: 23, timeTaken: "12:50", qualified: true },
  { rank: 9, teamId: "T11", teamName: "Loop Lords", score: 22, timeTaken: "18:05", qualified: true },
  { rank: 10, teamId: "T04", teamName: "Cache Kings", score: 21, timeTaken: "14:40", qualified: true },
  { rank: 11, teamId: "T09", teamName: "Null Pointers", score: 20, timeTaken: "16:15", qualified: false },
  { rank: 12, teamId: "T14", teamName: "Git Pushers", score: 19, timeTaken: "19:30", qualified: false },
  { rank: 13, teamId: "T06", teamName: "API Avengers", score: 18, timeTaken: "20:00", qualified: false },
  { rank: 14, teamId: "T18", teamName: "Merge Masters", score: 17, timeTaken: "15:55", qualified: false },
  { rank: 15, teamId: "T02", teamName: "Fork Fighters", score: 15, timeTaken: "22:10", qualified: false },
]

export function LeaderboardPage({ onGoToAdmin, currentTeamId = "T01" }: LeaderboardPageProps) {
  const currentTeam = MOCK_LEADERBOARD.find((t) => t.teamId === currentTeamId)
  const topThree = MOCK_LEADERBOARD.slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
              <Zap className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Leaderboard</h1>
              <p className="text-xs text-muted-foreground">Round 1 Results</p>
            </div>
          </div>
          <button
            onClick={onGoToAdmin}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin Panel
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {/* 2nd place */}
          <div className="flex flex-col items-center mt-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center mb-2">
              <Medal className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">{topThree[1].teamId}</span>
            <span className="text-sm font-semibold text-foreground mt-0.5 text-center">{topThree[1].teamName}</span>
            <Badge variant="secondary" className="mt-1.5 text-xs">{topThree[1].score}/30</Badge>
            <div className="w-full h-20 bg-secondary/50 rounded-t-xl mt-3 border border-b-0 border-border/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">2</span>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-2">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            <span className="text-xs font-mono text-primary">{topThree[0].teamId}</span>
            <span className="text-sm font-semibold text-foreground mt-0.5 text-center">{topThree[0].teamName}</span>
            <Badge className="mt-1.5 text-xs bg-primary text-primary-foreground">{topThree[0].score}/30</Badge>
            <div className="w-full h-28 bg-primary/10 rounded-t-xl mt-3 border border-b-0 border-primary/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">1</span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center mt-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center mb-2">
              <Medal className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">{topThree[2].teamId}</span>
            <span className="text-sm font-semibold text-foreground mt-0.5 text-center">{topThree[2].teamName}</span>
            <Badge variant="secondary" className="mt-1.5 text-xs">{topThree[2].score}/30</Badge>
            <div className="w-full h-14 bg-secondary/30 rounded-t-xl mt-3 border border-b-0 border-border/20 flex items-center justify-center">
              <span className="text-xl font-bold text-muted-foreground">3</span>
            </div>
          </div>
        </div>

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
                      <span className="text-sm font-semibold text-foreground">{currentTeam.teamName}</span>
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">You</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{currentTeam.teamId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-lg font-bold text-primary">{currentTeam.score}/30</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Clock className="w-3 h-3" />
                      {currentTeam.timeTaken}
                    </div>
                  </div>
                  {currentTeam.qualified && (
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
              <span className="text-xs text-muted-foreground">{MOCK_LEADERBOARD.length} teams</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="px-4 pb-4">
                {/* Table Header */}
                <div className="grid grid-cols-[3rem_1fr_5rem_5rem_6rem] gap-2 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/30 sticky top-0 bg-card/95 backdrop-blur-sm">
                  <span>Rank</span>
                  <span>Team</span>
                  <span className="text-right">Score</span>
                  <span className="text-right">Time</span>
                  <span className="text-right">Status</span>
                </div>

                {/* Table Rows */}
                {MOCK_LEADERBOARD.map((team) => {
                  const isCurrentTeam = team.teamId === currentTeamId
                  return (
                    <div
                      key={team.teamId}
                      className={`grid grid-cols-[3rem_1fr_5rem_5rem_6rem] gap-2 py-3 items-center border-b border-border/20 last:border-0 text-sm transition-colors ${
                        isCurrentTeam ? "bg-primary/5 -mx-4 px-4 rounded-lg" : ""
                      }`}
                    >
                      <span className={`font-bold ${team.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                        #{team.rank}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className={`font-medium truncate ${isCurrentTeam ? "text-primary" : "text-foreground"}`}>
                          {team.teamName}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{team.teamId}</span>
                      </div>
                      <span className="text-right font-semibold text-foreground">{team.score}/30</span>
                      <span className="text-right text-muted-foreground font-mono text-xs">{team.timeTaken}</span>
                      <span className="text-right">
                        {team.qualified ? (
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
