'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('rentora-theme') || 'light'
    setIsDark(saved === 'dark')
  }, [])

  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    localStorage.setItem('rentora-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'relative',
        width: '56px',
        height: '30px',
        borderRadius: '999px',
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : '1px solid rgba(0,0,0,0.12)',
        background: isDark
          ? 'linear-gradient(135deg, #111318, #1A1E26)'
          : 'linear-gradient(135deg, #E8ECF1, #F4F6F9)',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isDark
          ? 'inset 0 1px 3px rgba(0,0,0,0.4)'
          : 'inset 0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Sliding knob */}
      <div style={{
        position: 'absolute',
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: isDark
          ? 'linear-gradient(135deg, #1A7A52, #2ECC8F)'
          : 'linear-gradient(135deg, #C9A84C, #E2C07A)',
        boxShadow: isDark
          ? '0 2px 8px rgba(34,168,118,0.4)'
          : '0 2px 8px rgba(201,168,76,0.4)',
        left: isDark ? '30px' : '4px',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {isDark
          ? <Moon size={12} color="#FFFFFF" strokeWidth={2.5} />
          : <Sun size={12} color="#FFFFFF" strokeWidth={2.5} />
        }
      </div>
    </button>
  )
}