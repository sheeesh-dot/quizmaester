"use client"

import { useState, useEffect } from "react"
import { Shield, Eye, EyeOff, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginPageProps {
  onLogin: (teamId: string, teamName: string) => void
}

interface Team {
  id: string
  team_name: string
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [error, setError] = useState("")

  // Fetch real team list from database on mount
  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => {
        setTeams(data.teams || [])
        setLoadingTeams(false)
      })
      .catch(() => {
        setError("Failed to load teams. Please refresh.")
        setLoadingTeams(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedTeamId) {
      setError("Please select your team.")
      return
    }
    if (!secretCode.trim()) {
      setError("Please enter your secret code.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: selectedTeamId,
          secret_code: secretCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please try again.")
        setIsLoading(false)
        return
      }

      // Pass real team ID and name up to parent
      const selectedTeam = teams.find((t) => t.id === selectedTeamId)
      onLogin(selectedTeamId, selectedTeam?.team_name || "")

    } catch (err) {
      setError("Network error. Please check your connection and try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo area */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">HackQuiz Arena</h1>
            <p className="text-muted-foreground text-sm mt-1">Round 1 Qualification</p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Team Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to begin the quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Team dropdown */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="team-select" className="text-sm font-medium text-foreground">
                  Select Your Team
                </Label>
                {loadingTeams ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm h-11">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading teams...
                  </div>
                ) : (
                  <select
                    id="team-select"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="bg-secondary/50 border border-border/50 text-foreground h-11 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">-- Select your team --</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="secret-code" className="text-sm font-medium text-foreground">
                  Secret Access Code
                </Label>
                <div className="relative">
                  <Input
                    id="secret-code"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secret code"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-11 pr-11"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2.5 border border-destructive/20">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || loadingTeams}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  "Login & Enter Arena"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/30">
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
                <p className="leading-relaxed">
                  Each team gets one attempt. Once the test starts, it cannot be restarted. Switching tabs or refreshing will auto-submit your answers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}