"use client"

import { useEffect } from "react"
import { useHealthStore } from "@/store/useHealthStore"

export function Providers({ children }: { children: React.ReactNode }) {
  const initializeData = useHealthStore(state => state.initializeData)
  
  useEffect(() => {
    // Initialize health data on app load
    initializeData()
  }, [initializeData])
  
  return <>{children}</>
}
