"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Clock, ChevronRight, Send, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface QuizPageProps {
  onSubmit: () => void
  teamId: string
}

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

const TOTAL_TIME = 30 * 60

export function QuizPage({ onSubmit, teamId }: QuizPageProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [mounted, setMounted] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  const questionsPerPage = 10
  const totalPages = Math.ceil(questions.length / questionsPerPage)
  const startIdx = currentPage * questionsPerPage
  const currentQuestions = questions.slice(startIdx, startIdx + questionsPerPage)
  const answeredCount = Object.keys(answers).length
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  // Fetch real questions from backend
  useEffect(() => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setLoadError(data.error)
        } else {
          setQuestions(data.questions || [])
        }
        setLoading(false)
      })
      .catch(() => {
        setLoadError("Failed to load questions. Please refresh.")
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!mounted || loading) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinalSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [mounted, loading])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const selectAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 1000)
  }

  const handleFinalSubmit = async () => {
    setSubmitting(true)
    try {
      const formattedAnswers = Object.entries(answers).map(([question_id, selected_option]) => ({
        question_id,
        selected_option,
      }))

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      })

      // Whether it succeeds or fails, move to leaderboard
      onSubmitRef.current()
    } catch {
      onSubmitRef.current()
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const isTimeCritical = timeLeft <= 300
  const isTimeUrgent = timeLeft <= 60
  const pageAnsweredCount = currentQuestions.filter((q) => answers[q.id]).length

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading your questions...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm border-destructive/30 bg-card">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
            <p className="text-sm text-destructive font-medium">{loadError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 w-full" variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Badge variant="outline" className="shrink-0 font-mono text-xs border-primary/30 text-primary">
                {teamId ? teamId.slice(0, 8) + '...' : 'Loading...'}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{answeredCount}</span>
                <span>/</span>
                <span>{questions.length}</span>
                <span className="hidden sm:inline">answered</span>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold transition-colors ${
                isTimeUrgent
                  ? "bg-destructive/15 border-destructive/30 text-destructive animate-pulse"
                  : isTimeCritical
                    ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-500"
                    : "bg-secondary/50 border-border/50 text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>

            {savedIndicator && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </div>
            )}
          </div>
          <div className="mt-2.5">
            <Progress value={progressPercent} className="h-1.5 bg-secondary/50" />
          </div>
        </div>
      </header>

      {/* Page Indicator */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Page {currentPage + 1} of {totalPages}
            </h2>
            <span className="text-xs text-muted-foreground">
              ({pageAnsweredCount}/{currentQuestions.length} answered)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentPage ? "w-8 bg-primary" : i < currentPage ? "w-4 bg-primary/40" : "w-4 bg-secondary"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <main className="flex-1 max-w-4xl mx-auto px-4 pb-8 w-full">
        <div className="flex flex-col gap-4 mt-4">
          {currentQuestions.map((question, index) => (
            <Card
              key={question.id}
              className={`border-border/40 bg-card/60 transition-all ${
                answers[question.id] ? "border-primary/20" : ""
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 ${
                      answers[question.id]
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary text-muted-foreground border border-border/50"
                    }`}
                  >
                    {startIdx + index + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground leading-relaxed pt-0.5">
                    {question.question_text}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-10">
                  {[
                    { key: "A", value: question.option_a },
                    { key: "B", value: question.option_b },
                    { key: "C", value: question.option_c },
                    { key: "D", value: question.option_d },
                  ].map((option) => {
                    const isSelected = answers[question.id] === option.key
                    return (
                      <button
                        key={option.key}
                        onClick={() => selectAnswer(question.id, option.key)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-left text-sm transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary/40 text-foreground ring-1 ring-primary/20"
                            : "bg-secondary/30 border-border/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:border-border"
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0 ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/80 text-muted-foreground border border-border/50"
                          }`}
                        >
                          {option.key}
                        </span>
                        <span className="leading-snug">{option.value}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            {answeredCount < questions.length
              ? `${questions.length - answeredCount} questions remaining`
              : "All questions answered"}
          </p>
          {currentPage < totalPages - 1 ? (
            <Button
              onClick={handleNextPage}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
            >
              Next Page
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setShowWarning(true)}
              disabled={submitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Quiz
            </Button>
          )}
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <Card className="w-full max-w-sm border-border/50 bg-card shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Submit Quiz?</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    You have answered{" "}
                    <span className="font-semibold text-foreground">
                      {answeredCount}/{questions.length}
                    </span>{" "}
                    questions.
                    {answeredCount < questions.length && " Unanswered questions will be marked incorrect."}
                    {" "}This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowWarning(false)}
                    className="flex-1 border-border/50"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowWarning(false)
                      handleFinalSubmit()
                    }}
                    disabled={submitting}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Confirm Submit"
                    )}
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