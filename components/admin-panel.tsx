"use client"

import { useState, useEffect } from "react"
import { Shield, Loader2, Trophy, RefreshCw, Users, Trash2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AdminPanelProps {
  onBack: () => void
}

interface LeaderboardEntry {
  rank: number
  team_id: string
  team_name: string
  total_correct: number
  completion_time: number
  round2_status: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [adminSecret, setAdminSecret] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [topN, setTopN] = useState(5)
  const [promoteLoading, setPromoteLoading] = useState(false)
  const [promoteResult, setPromoteResult] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetResult, setResetResult] = useState("")

  // Verify admin secret against ADMIN_SECRET env var via a simple endpoint
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError("")

    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: adminSecret }),
    })

    if (res.ok) {
      setIsAuthenticated(true)
      loadLeaderboard()
    } else {
      setAuthError("Wrong admin password. Try again.")
    }
    setAuthLoading(false)
  }

  async function loadLeaderboard() {
    setLoadingLeaderboard(true)
    const res = await fetch("/api/leaderboard")
    const data = await res.json()
    const ranked = (data.leaderboard || []).map((e: any, i: number) => ({
      ...e,
      rank: i + 1,
    }))
    setLeaderboard(ranked)
    setLoadingLeaderboard(false)
  }

  async function handlePromote() {
    setPromoteLoading(true)
    setPromoteResult("")
    const res = await fetch("/api/admin/promote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminSecret}`,
      },
      body: JSON.stringify({ top_n: topN }),
    })
    const data = await res.json()
    if (res.ok) {
      const promoted = data.promoted_team_ids?.length || 0
      setPromoteResult(promoted > 0
        ? `✅ ${promoted} teams promoted to Round 2!`
        : `⚠️ No completed attempts found — teams must finish the quiz first!`)
      loadLeaderboard()
    } else {
      setPromoteResult(`❌ ${data.error || "Failed to promote"}`)
    }
    setPromoteLoading(false)
  }

  async function handleReset() {
    if (!confirm("This will reset ALL attempts and allow teams to log in again. Are you sure?")) return
    setResetLoading(true)
    setResetResult("")
    const res = await fetch("/api/admin/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminSecret}`,
      },
    })
    const data = await res.json()
    if (res.ok) {
      setResetResult("✅ All attempts reset. Teams can log in again.")
      loadLeaderboard()
    } else {
      setResetResult(`❌ ${data.error || "Failed to reset"}`)
    }
    setResetLoading(false)
  }

  // ── Login screen ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-lg">Admin Access</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Tech team only</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="bg-secondary/50 border-border/50 h-11"
                autoComplete="off"
              />
              {authError && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
                  {authError}
                </p>
              )}
              <Button type="submit" disabled={authLoading} className="w-full h-11">
                {authLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Enter Admin Panel"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="w-full text-muted-foreground text-sm"
              >
                ← Back to Leaderboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Main Admin Panel ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Tech team controls</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onBack} className="text-xs text-muted-foreground">
            ← Back
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full flex flex-col gap-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{leaderboard.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Teams Completed</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {leaderboard.filter((t) => t.round2_status).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Promoted to Round 2</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {leaderboard.length > 0
                  ? Math.round(leaderboard.reduce((a, b) => a + b.total_correct, 0) / leaderboard.length)
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg Score /30</p>
            </CardContent>
          </Card>
        </div>

        {/* Promote section */}
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Promote to Round 2
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              Select top N teams by score (ties broken by completion time) and mark them as Round 2 qualifiers.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Number of teams to promote</label>
                <Input
                  type="number"
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value))}
                  min={1}
                  max={leaderboard.length || 10}
                  className="w-24 bg-secondary/50 border-border/50 h-9"
                />
              </div>
              <Button
                onClick={handlePromote}
                disabled={promoteLoading}
                className="mt-5 bg-primary text-primary-foreground"
              >
                {promoteLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Promoting...
                  </span>
                ) : (
                  `Promote Top ${topN}`
                )}
              </Button>
            </div>
            {promoteResult && (
              <p className="text-sm font-medium">{promoteResult}</p>
            )}
          </CardContent>
        </Card>

        {/* Reset section */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              Reset All Attempts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Clears all quiz attempts and team_questions. Teams will be able to log in and take the quiz again. Use this for testing only.
            </p>
            <Button
              onClick={handleReset}
              disabled={resetLoading}
              variant="destructive"
              className="w-fit"
            >
              {resetLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </span>
              ) : (
                "Reset All Data"
              )}
            </Button>
            {resetResult && <p className="text-sm font-medium">{resetResult}</p>}
          </CardContent>
        </Card>

        {/* Leaderboard table */}
        <Card className="border-border/40 bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Live Leaderboard
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadLeaderboard}
                disabled={loadingLeaderboard}
                className="text-xs text-muted-foreground gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLeaderboard ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leaderboard.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                No teams have completed the quiz yet.
              </p>
            ) : (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-[3rem_1fr_5rem_5rem_6rem] gap-2 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/30">
                  <span>Rank</span>
                  <span>Team</span>
                  <span className="text-right">Score</span>
                  <span className="text-right">Time</span>
                  <span className="text-right">Status</span>
                </div>
                {leaderboard.map((team) => (
                  <div
                    key={team.team_id}
                    className="grid grid-cols-[3rem_1fr_5rem_5rem_6rem] gap-2 py-3 items-center border-b border-border/20 last:border-0 text-sm"
                  >
                    <span className={`font-bold ${team.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                      #{team.rank}
                    </span>
                    <span className="font-medium text-foreground truncate">{team.team_name}</span>
                    <span className="text-right font-semibold">{team.total_correct}/30</span>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}