"use client"

import { useState } from "react"
import { LoginPage } from "@/components/login-page"
import { StartTest } from "@/components/start-test"
import { QuizPage } from "@/components/quiz-page"
import { LeaderboardPage } from "@/components/leaderboard-page"
import { AdminPanel } from "@/components/admin-panel"

type View = "login" | "startTest" | "quiz" | "leaderboard" | "admin"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("login")

  return (
    <>
      {currentView === "login" && (
        <LoginPage onLogin={() => setCurrentView("startTest")} />
      )}
      {currentView === "startTest" && (
        <StartTest onStartTest={() => setCurrentView("quiz")} teamId="T01" />
      )}
      {currentView === "quiz" && (
        <QuizPage onSubmit={() => setCurrentView("leaderboard")} />
      )}
      {currentView === "leaderboard" && (
        <LeaderboardPage
          onGoToAdmin={() => setCurrentView("admin")}
          currentTeamId="T01"
        />
      )}
      {currentView === "admin" && (
        <AdminPanel onBack={() => setCurrentView("leaderboard")} />
      )}
    </>
  )
}
