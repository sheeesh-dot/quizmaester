"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Clock, ChevronRight, Send, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface QuizPageProps {
  onSubmit: () => void
}

const SAMPLE_QUESTIONS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  question_text: `Sample Question ${i + 1}: This is a placeholder question about hackathon concepts and programming fundamentals?`,
  option_a: "Option A - First possible answer",
  option_b: "Option B - Second possible answer",
  option_c: "Option C - Third possible answer",
  option_d: "Option D - Fourth possible answer",
}))

const TOTAL_TIME = 30 * 60 // 30 minutes in seconds

export function QuizPage({ onSubmit }: QuizPageProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [mounted, setMounted] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  const questionsPerPage = 10
  const totalPages = 3
  const startIdx = currentPage * questionsPerPage
  const endIdx = startIdx + questionsPerPage
  const currentQuestions = SAMPLE_QUESTIONS.slice(startIdx, endIdx)

  const answeredCount = Object.keys(answers).length
  const progressPercent = (answeredCount / 30) * 100

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onSubmitRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [mounted])

  const selectAnswer = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 1000)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = () => {
    setShowWarning(true)
  }

  const confirmSubmit = () => {
    setShowWarning(false)
    onSubmit()
  }

  const isTimeCritical = timeLeft <= 300 // 5 minutes
  const isTimeUrgent = timeLeft <= 60 // 1 minute

  const pageAnsweredCount = currentQuestions.filter((q) => answers[q.id]).length

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Team & Progress */}
            <div className="flex items-center gap-3 min-w-0">
              <Badge variant="outline" className="shrink-0 font-mono text-xs border-primary/30 text-primary">
                T01
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{answeredCount}</span>
                <span>/</span>
                <span>30</span>
                <span className="hidden sm:inline">answered</span>
              </div>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold transition-colors ${
                isTimeUrgent
                  ? "bg-destructive/15 border-destructive/30 text-destructive animate-pulse"
                  : isTimeCritical
                    ? "bg-warning/15 border-warning/30 text-warning"
                    : "bg-secondary/50 border-border/50 text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>

            {/* Auto-save indicator */}
            {savedIndicator && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </div>
            )}
          </div>

          {/* Progress bar */}
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
              ({pageAnsweredCount}/{questionsPerPage} answered)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentPage
                    ? "w-8 bg-primary"
                    : i < currentPage
                      ? "w-4 bg-primary/40"
                      : "w-4 bg-secondary"
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
            {answeredCount < 30
              ? `${30 - answeredCount} questions remaining`
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
              onClick={handleSubmit}
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
                <div className="w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Submit Quiz?</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    You have answered <span className="font-semibold text-foreground">{answeredCount}/30</span> questions.
                    {answeredCount < 30 && " Unanswered questions will be marked incorrect."}
                    {" "}This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowWarning(false)}
                    className="flex-1 border-border/50 text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmSubmit}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    Confirm Submit
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
