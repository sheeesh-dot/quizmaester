"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
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
    setTimeout(() => { setTheme(nextTheme) }, 500)
    setTimeout(() => { setOverlayPhase("collapsing") }, 650)
    setTimeout(() => { setOverlayPhase("idle"); setIsAnimating(false) }, 1200)
  }

  if (!mounted) return null
  const isDark = theme === "dark"

  return (
    <>
      {/* Circle overlay — expands from top-right */}
      <div
        style={{
          position: "fixed",
          top: "-5vw",
          right: "-5vw",
          width: "10vw",
          height: "10vw",
          borderRadius: "50%",
          // Target color = what we're transitioning TO
          background: isDark ? "oklch(0.92 0.018 80)" : "oklch(0.18 0.025 250)",
          zIndex: 9999,
          pointerEvents: "none",
          // slow → fast → slow using cubic-bezier
          transform: overlayPhase === "expanding"
            ? "scale(30)"
            : "scale(0)",
          transition: overlayPhase === "expanding"
            ? "transform 0.7s cubic-bezier(0.37, 0, 0.63, 1)"
            : overlayPhase === "collapsing"
              ? "transform 0.55s cubic-bezier(0.37, 0, 0.63, 1)"
              : "none",
          opacity: 1,
        }}
      />

      {/* Button — top right */}
      <button
        onClick={handleToggle}
        disabled={isAnimating}
        aria-label="Toggle theme"
        className={`
          fixed top-5 right-5 z-[9998]
          w-12 h-12 rounded-full
          flex items-center justify-center
          shadow-lg border transition-colors duration-300
          focus:outline-none
          ${isDark
            ? "bg-secondary/80 border-border/50 hover:bg-secondary"
            : "bg-stone-200 border-stone-300 hover:bg-stone-300"
          }
        `}
      >
        <div style={{
          transition: "transform 0.5s cubic-bezier(0.37, 0, 0.63, 1)",
          transform: isAnimating ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          {isDark
            ? <Moon className="w-5 h-5 text-blue-400" />
            : <Sun className="w-5 h-5 text-yellow-500" />
          }
        </div>
      </button>
    </>
  )
}