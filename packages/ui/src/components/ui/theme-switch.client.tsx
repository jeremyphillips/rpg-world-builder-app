'use client'

import { Moon, Sun } from 'lucide-react'

import { useTheme } from '../../providers/theme-provider.client'
import { Switch } from './switch.client'

/**
 * Self-contained dark/light mode toggle for use in nav menus and toolbars.
 * Reads and writes the current theme via `useTheme()` — requires a `ThemeProvider`
 * ancestor (or falls back gracefully to light mode when absent).
 */
export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        {isDark ? (
          <Moon className="size-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Sun className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-sm">Dark mode</span>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label={isDark ? 'Disable dark mode' : 'Enable dark mode'}
      />
    </div>
  )
}
