"use client"

import { useState } from "react"
import {
  Users,
  FileQuestion,
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Download,
  RotateCcw,
  Shield,
  Copy,
  ArrowLeft,
  Zap,
  Eye,
  EyeOff,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AdminPanelProps {
  onBack: () => void
}

const MOCK_TEAMS = [
  { id: 1, teamId: "T01", teamName: "Pixel Pirates", secretCode: "px-8k2m", hasAttempted: true, score: 27, timeTaken: "16:45", qualified: true },
  { id: 2, teamId: "T02", teamName: "Fork Fighters", secretCode: "ff-3n7q", hasAttempted: true, score: 15, timeTaken: "22:10", qualified: false },
  { id: 3, teamId: "T03", teamName: "Debug Dynasty", secretCode: "dd-9p1x", hasAttempted: true, score: 25, timeTaken: "15:30", qualified: true },
  { id: 4, teamId: "T04", teamName: "Cache Kings", secretCode: "ck-5w3r", hasAttempted: true, score: 21, timeTaken: "14:40", qualified: true },
  { id: 5, teamId: "T05", teamName: "Binary Blazers", secretCode: "bb-7t6e", hasAttempted: true, score: 28, timeTaken: "12:34", qualified: true },
  { id: 6, teamId: "T06", teamName: "API Avengers", secretCode: "aa-2k8m", hasAttempted: true, score: 18, timeTaken: "20:00", qualified: false },
  { id: 7, teamId: "T07", teamName: "Bit Bandits", secretCode: "bb-4j9n", hasAttempted: true, score: 24, timeTaken: "17:10", qualified: true },
  { id: 8, teamId: "T08", teamName: "Stack Overflow", secretCode: "so-1m5k", hasAttempted: true, score: 26, timeTaken: "11:55", qualified: true },
  { id: 9, teamId: "T09", teamName: "Null Pointers", secretCode: "np-6r2t", hasAttempted: false, score: null, timeTaken: null, qualified: false },
  { id: 10, teamId: "T10", teamName: "Lambda Legends", secretCode: "ll-8v4w", hasAttempted: false, score: null, timeTaken: null, qualified: false },
]

const MOCK_QUESTIONS = [
  { id: 1, text: "What is the time complexity of binary search?", optA: "O(n)", optB: "O(log n)", optC: "O(n log n)", optD: "O(1)", correct: "B" },
  { id: 2, text: "Which data structure uses LIFO?", optA: "Queue", optB: "Array", optC: "Stack", optD: "Tree", correct: "C" },
  { id: 3, text: "What does HTML stand for?", optA: "Hyper Text Markup Language", optB: "High Tech Modern Language", optC: "Hyper Transfer Markup Language", optD: "Home Tool Markup Language", correct: "A" },
  { id: 4, text: "Which protocol is used for secure web browsing?", optA: "FTP", optB: "HTTP", optC: "HTTPS", optD: "SMTP", correct: "C" },
  { id: 5, text: "What is the output of 2 + '2' in JavaScript?", optA: "4", optB: "22", optC: "NaN", optD: "Error", correct: "B" },
]

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("teams")
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [revealedCodes, setRevealedCodes] = useState<Set<number>>(new Set())
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const toggleRevealCode = (id: number) => {
    setRevealedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalTeams = MOCK_TEAMS.length
  const attemptedTeams = MOCK_TEAMS.filter((t) => t.hasAttempted).length
  const qualifiedTeams = MOCK_TEAMS.filter((t) => t.qualified).length

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-secondary/50 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">HackQuiz Arena Management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-border/50 text-foreground"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Top 10</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border/50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalTeams}</p>
                <p className="text-xs text-muted-foreground">Total Teams</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <FileQuestion className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{attemptedTeams}</p>
                <p className="text-xs text-muted-foreground">Attempted</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{qualifiedTeams}</p>
                <p className="text-xs text-muted-foreground">Qualified</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 border border-border/30">
            <TabsTrigger value="teams" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5 text-xs">
              <FileQuestion className="w-3.5 h-3.5" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="rankings" className="gap-1.5 text-xs">
              <Trophy className="w-3.5 h-3.5" />
              Rankings
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Manage Teams</CardTitle>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowAddTeam(!showAddTeam)}
                  >
                    {showAddTeam ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showAddTeam ? "Cancel" : "Add Team"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Add Team Form */}
                {showAddTeam && (
                  <div className="px-4 pb-4 border-b border-border/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-secondary/30 rounded-lg border border-border/30">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Team Name</Label>
                        <Input placeholder="e.g., Code Warriors" className="h-9 text-sm bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Auto-generated ID</Label>
                        <div className="h-9 flex items-center px-3 rounded-md bg-secondary/80 border border-border/50 text-sm font-mono text-muted-foreground">
                          T11
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Auto-generated Code</Label>
                        <div className="h-9 flex items-center justify-between px-3 rounded-md bg-secondary/80 border border-border/50">
                          <span className="text-sm font-mono text-muted-foreground">cw-3k8p</span>
                          <button className="text-muted-foreground hover:text-foreground" aria-label="Copy code">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="sm:col-span-3 flex justify-end">
                        <Button size="sm" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                          Save Team
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <ScrollArea className="h-[400px]">
                  <div className="px-4">
                    {/* Header */}
                    <div className="grid grid-cols-[3rem_1fr_7rem_5rem_5rem_5rem_4rem] gap-2 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/30 sticky top-0 bg-card/95 backdrop-blur-sm">
                      <span>ID</span>
                      <span>Team Name</span>
                      <span>Secret Code</span>
                      <span className="text-center">Status</span>
                      <span className="text-right">Score</span>
                      <span className="text-right">Time</span>
                      <span className="text-right">Actions</span>
                    </div>

                    {MOCK_TEAMS.map((team) => (
                      <div
                        key={team.id}
                        className="grid grid-cols-[3rem_1fr_7rem_5rem_5rem_5rem_4rem] gap-2 py-3 items-center border-b border-border/20 last:border-0 text-sm"
                      >
                        <span className="font-mono text-xs text-muted-foreground">{team.teamId}</span>
                        <span className="font-medium text-foreground truncate">{team.teamName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-muted-foreground">
                            {revealedCodes.has(team.id) ? team.secretCode : "********"}
                          </span>
                          <button
                            onClick={() => toggleRevealCode(team.id)}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                            aria-label={revealedCodes.has(team.id) ? "Hide code" : "Show code"}
                          >
                            {revealedCodes.has(team.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                        <span className="text-center">
                          {team.hasAttempted ? (
                            <Badge variant="secondary" className="text-[10px]">Done</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">Pending</Badge>
                          )}
                        </span>
                        <span className="text-right font-mono text-xs text-foreground">
                          {team.score !== null ? `${team.score}/30` : "--"}
                        </span>
                        <span className="text-right font-mono text-xs text-muted-foreground">
                          {team.timeTaken ?? "--"}
                        </span>
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit team">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete team">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Manage Questions
                    <span className="ml-2 text-xs font-normal text-muted-foreground">({MOCK_QUESTIONS.length} total)</span>
                  </CardTitle>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowAddQuestion(!showAddQuestion)}
                  >
                    {showAddQuestion ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showAddQuestion ? "Cancel" : "Add Question"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add Question Form */}
                {showAddQuestion && (
                  <div className="mb-4 p-4 bg-secondary/30 rounded-lg border border-border/30">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">Question Text</Label>
                        <Input placeholder="Enter your question..." className="h-9 text-sm bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs text-muted-foreground">Option A</Label>
                          <Input placeholder="Option A" className="h-9 text-sm bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs text-muted-foreground">Option B</Label>
                          <Input placeholder="Option B" className="h-9 text-sm bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs text-muted-foreground">Option C</Label>
                          <Input placeholder="Option C" className="h-9 text-sm bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs text-muted-foreground">Option D</Label>
                          <Input placeholder="Option D" className="h-9 text-sm bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" />
                        </div>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className="flex flex-col gap-1.5 w-32">
                          <Label className="text-xs text-muted-foreground">Correct Answer</Label>
                          <Input placeholder="A, B, C, or D" className="h-9 text-sm bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" />
                        </div>
                        <Button size="sm" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                          Save Question
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <ScrollArea className="h-[380px]">
                  <div className="flex flex-col gap-3">
                    {MOCK_QUESTIONS.map((q, index) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-lg border border-border/30 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary text-xs font-bold text-muted-foreground border border-border/50 shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex flex-col gap-2 min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground leading-relaxed">{q.text}</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { key: "A", val: q.optA },
                                  { key: "B", val: q.optB },
                                  { key: "C", val: q.optC },
                                  { key: "D", val: q.optD },
                                ].map((opt) => (
                                  <span
                                    key={opt.key}
                                    className={`text-xs px-2 py-1 rounded ${
                                      q.correct === opt.key
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <span className="font-semibold">{opt.key}.</span> {opt.val}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit question">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete question">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rankings Tab */}
          <TabsContent value="rankings">
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Rankings Overview</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 border-border/50 text-foreground"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem_6rem] gap-2 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/30 sticky top-0 bg-card/95 backdrop-blur-sm">
                      <span>#</span>
                      <span>Team</span>
                      <span className="text-right">Score</span>
                      <span className="text-right">Time</span>
                      <span className="text-right">Status</span>
                    </div>
                    {MOCK_TEAMS
                      .filter((t) => t.hasAttempted && t.score !== null)
                      .sort((a, b) => {
                        if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0)
                        return 0
                      })
                      .map((team, i) => (
                        <div
                          key={team.id}
                          className="grid grid-cols-[2.5rem_1fr_5rem_5rem_6rem] gap-2 py-3 items-center border-b border-border/20 last:border-0 text-sm"
                        >
                          <span className={`font-bold text-xs ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>
                            #{i + 1}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground truncate">{team.teamName}</span>
                            <span className="text-xs text-muted-foreground font-mono">{team.teamId}</span>
                          </div>
                          <span className="text-right font-semibold text-foreground">{team.score}/30</span>
                          <span className="text-right text-xs font-mono text-muted-foreground">{team.timeTaken}</span>
                          <span className="text-right">
                            {team.qualified ? (
                              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-1.5">
                                Qualified
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">--</span>
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <Card className="w-full max-w-sm border-border/50 bg-card shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Reset Leaderboard?</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    This will clear all scores, attempts, and session data. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 border-border/50 text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                  >
                    Reset All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
