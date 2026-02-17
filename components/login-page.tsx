"use client"

import { useState } from "react"
import { Shield, Eye, EyeOff, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [teamId, setTeamId] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!teamId.trim() || !secretCode.trim()) {
      setError("Both fields are required.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1500)
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="team-id" className="text-sm font-medium text-foreground">
                  Team ID
                </Label>
                <Input
                  id="team-id"
                  type="text"
                  placeholder="e.g., T01"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value.toUpperCase())}
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-11 font-mono tracking-wider"
                  autoComplete="off"
                />
              </div>

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
                disabled={isLoading}
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
