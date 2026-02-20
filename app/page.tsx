"use client"
import { useState, useEffect } from "react"
import { LoginPage } from "@/components/login-page"
import { StartTest } from "@/components/start-test"
import { QuizPage } from "@/components/quiz-page"
import { LeaderboardPage } from "@/components/leaderboard-page"
import { AdminPanel } from "@/components/admin-panel"

type View = "login" | "startTest" | "quiz" | "leaderboard" | "admin"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("login")
  const [teamId, setTeamId] = useState<string>("")
  const [teamName, setTeamName] = useState<string>("")

  useEffect(() => {
    // Listen for gear icon click from any page
    const handler = () => setCurrentView("admin")
    window.addEventListener("openAdmin", handler)

    // Also check sessionStorage in case event fired before listener was ready
    if (sessionStorage.getItem("openAdmin") === "true") {
      sessionStorage.removeItem("openAdmin")
      setCurrentView("admin")
    }

    return () => window.removeEventListener("openAdmin", handler)
  }, [])

  return (
    <>
      {currentView === "login" && (
        <LoginPage
          onLogin={(id, name) => {
            setTeamId(id)
            setTeamName(name)
            setCurrentView("startTest")
          }}
        />
      )}
      {currentView === "startTest" && (
        <StartTest
          onStartTest={() => setCurrentView("quiz")}
          teamId={teamId}
          teamName={teamName}
        />
      )}
      {currentView === "quiz" && (
        <QuizPage
          onSubmit={() => setCurrentView("leaderboard")}
          teamId={teamId}
        />
      )}
      {currentView === "leaderboard" && (
        <LeaderboardPage
          currentTeamId={teamId}
          onGoToAdmin={() => setCurrentView("admin")}
        />
      )}
      {currentView === "admin" && (
        <AdminPanel onBack={() => setCurrentView("leaderboard")} />
      )}
    </>
  )
}