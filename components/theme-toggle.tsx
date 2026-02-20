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
          ...(typeof window !== "undefined" && window.innerWidth >= 768
            ? { top: "-60px", right: "-60px", bottom: "auto" }   // desktop: top-right
            : { bottom: "-60px", right: "-60px", top: "auto" }   // mobile: bottom-right
          ),
          // Fixed px size so scale is predictable on all screen sizes
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: isDark ? "oklch(0.92 0.018 80)" : "oklch(0.18 0.025 250)",
          zIndex: 9999,
          pointerEvents: "none",
          // Scale calculated to always cover full screen diagonally
          // diagonal of largest screen (4K) / half of circle size
          // 120px circle, scale 25 = 3000px diameter — covers any screen
          transform: overlayPhase === "expanding"
            ? "scale(25)"
            : "scale(0)",
          transformOrigin: "center",
          transition: overlayPhase === "expanding"
            ? "transform 0.75s cubic-bezier(0.37, 0, 0.63, 1)"
            : overlayPhase === "collapsing"
              ? "transform 0.6s cubic-bezier(0.37, 0, 0.63, 1)"
              : "none",
          opacity: 1,
          willChange: "transform",
        }}
      />

      {/* Button — top right */}
      <button
        onClick={handleToggle}
        disabled={isAnimating}
        aria-label="Toggle theme"
        className={`
          fixed z-[9998]
          bottom-6 right-5
          md:bottom-auto md:top-5 md:right-5
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