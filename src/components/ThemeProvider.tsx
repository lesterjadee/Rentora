'use client'

import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync React state with whatever was set by the inline script
    const saved = localStorage.getItem('rentora-theme') || 'light'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  return <>{children}</>
}