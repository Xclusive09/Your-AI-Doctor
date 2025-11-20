"use client"

import { useEffect } from "react"
import { useThemeStore } from "@/store/useThemeStore"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore(state => state.theme)

  useEffect(() => {
    // Apply theme on mount and when it changes
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  return <>{children}</>
}
