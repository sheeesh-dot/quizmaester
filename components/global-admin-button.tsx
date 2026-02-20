"use client"

export function GlobalAdminButton() {
  const handleClick = () => {
    // Dispatch event for page.tsx to catch
    window.dispatchEvent(new CustomEvent("openAdmin"))
    // Also set sessionStorage as fallback
    sessionStorage.setItem("openAdmin", "true")
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 left-4 z-[9997] text-muted-foreground/20 hover:text-muted-foreground/50 transition-colors text-lg select-none cursor-pointer"
      aria-label=""
      title=""
    >
      ⚙
    </button>
  )
}