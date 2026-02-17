"use client"

import { useState } from "react"
import { AlertTriangle, Clock, FileQuestion, ShieldCheck, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StartTestProps {
  onStartTest: () => void
  teamId: string
}

export function StartTest({ onStartTest, teamId }: StartTestProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleStart = () => {
    setIsStarting(true)
    setTimeout(() => {
      onStartTest()
    }, 1000)
  }

  const rules = [
    {
      icon: FileQuestion,
      title: "30 Questions",
      description: "Split across 3 pages (10 each). No going back to previous pages.",
    },
    {
      icon: Clock,
      title: "Time Limit",
      description: "You have 30 minutes. Timer starts when you click Start. Auto-submit on expiry.",
    },
    {
      icon: AlertTriangle,
      title: "Anti-Cheat Active",
      description: "Tab switches are logged. Refreshing or leaving auto-submits your quiz.",
    },
    {
      icon: ShieldCheck,
      title: "Single Attempt",
      description: "Once started, you cannot restart. Your answers are auto-saved.",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Ready to Begin?</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Team <span className="font-mono text-primary">{teamId}</span> - Please read the rules carefully
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quiz Rules</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary/80 border border-border/50 shrink-0 mt-0.5">
                  <rule.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{rule.title}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{rule.description}</span>
                </div>
              </div>
            ))}

            <div className="mt-2 pt-4 border-t border-border/30">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border bg-secondary accent-primary"
                />
                <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  I understand the rules and confirm this is my only attempt.
                </span>
              </label>
            </div>

            <Button
              onClick={handleStart}
              disabled={!confirmed || isStarting}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm mt-2 transition-all disabled:opacity-40"
            >
              {isStarting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing Quiz...
                </span>
              ) : (
                "Start Test"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
