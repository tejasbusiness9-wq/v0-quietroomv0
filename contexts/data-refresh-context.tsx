"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

interface DataRefreshContextType {
  refreshTrigger: number
  triggerRefresh: () => void
}

const DataRefreshContext = createContext<DataRefreshContextType>({
  refreshTrigger: 0,
  triggerRefresh: () => {},
})

export function DataRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("[v0] Tab became visible, triggering refresh")
        triggerRefresh()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [triggerRefresh])

  return (
    <DataRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>{children}</DataRefreshContext.Provider>
  )
}

export function useDataRefresh() {
  const context = useContext(DataRefreshContext)
  if (!context) {
    throw new Error("useDataRefresh must be used within DataRefreshProvider")
  }
  return context
}
