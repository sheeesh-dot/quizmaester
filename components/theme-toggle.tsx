"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [overlayPhase, setOverlayPhase] = useState<"idle" | "expanding" | "collapsing">("idle")

  useEffect(() => { setMounted(true) }, [])

  const handleToggle = () => {
    if (isAnimating) return
    const nextTheme = theme === "dark" ? "light" : "dark"
    setIsAnimating(true)
    setOverlayPhase("expanding")
    setTimeout(() => { setTheme(nextTheme) }, 350)
    setTimeout(() => { setOverlayPhase("collapsing") }, 500)
    setTimeout(() => { setOverlayPhase("idle"); setIsAnimating(false) }, 900)
  }

  if (!mounted) return null
  const isDark = theme === "dark"

  return (
    <>
      {/* Full screen wipe overlay */}
      <div
        className={`fixed inset-0 z-[9999] pointer-events-none ${isDark ? "bg-[oklch(0.97_0.018_85)]" : "bg-[oklch(0.13_0.005_260)]"}`}
        style={{
          transform: overlayPhase === "idle" ? "scaleX(0)" : overlayPhase === "expanding" ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: overlayPhase === "expanding" ? "right" : "left",
          transition: overlayPhase === "expanding"
            ? "transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)"
            : overlayPhase === "collapsing"
              ? "transform 0.4s cubic-bezier(0.65, 0, 0.35, 1)"
              : "none",
        }}
      />

      {/* Fixed vertical toggle on right side */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-[9998] flex flex-col items-center gap-2">
        {/* Sun icon top */}
        <Sun className={`w-3.5 h-3.5 transition-all duration-300 ${!isDark ? "text-yellow-500 scale-110" : "text-muted-foreground/40 scale-90"}`} />

        {/* Toggle pill */}
        <button
          onClick={handleToggle}
          disabled={isAnimating}
          aria-label="Toggle theme"
          className={`relative w-8 h-16 rounded-full border transition-colors duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isDark ? "bg-secondary/80 border-border/50" : "bg-stone-200 border-stone-300"}`}
        >
          {/* Sliding thumb */}
          <span
            className={`absolute left-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center ${isDark ? "bg-white" : "bg-gray-800"}`}
            style={{
              top: isDark ? "4px" : "calc(100% - 28px)",
              transition: "top 0.55s cubic-bezier(0.65, 0, 0.35, 1) 0.08s, background 0.4s ease",
            }}
          >
            {isDark
              ? <Moon className="w-3 h-3 text-gray-800" />
              : <Sun className="w-3 h-3 text-yellow-400" />
            }
          </span>
        </button>

        {/* Moon icon bottom */}
        <Moon className={`w-3.5 h-3.5 transition-all duration-300 ${isDark ? "text-blue-400 scale-110" : "text-muted-foreground/40 scale-90"}`} />
      </div>
    </>
  )
}