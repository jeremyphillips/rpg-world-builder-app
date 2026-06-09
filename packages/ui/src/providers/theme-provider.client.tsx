'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

/** localStorage key shared with the anti-FOUC inline script in apps/dashboard/index.html. */
export const THEME_STORAGE_KEY = 'rpg-theme'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

/**
 * Exported so Storybook decorators can provide a controlled context value (seeded
 * from the toolbar global) without localStorage side-effects.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Manages the `.dark` class on `document.documentElement` and persists to localStorage. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

/**
 * Returns the current theme and toggle. Falls back to `{ theme: 'light', toggleTheme: noop }`
 * when called outside a ThemeProvider — safe for isolated test renders and server environments.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? { theme: 'light', toggleTheme: () => {} }
}
