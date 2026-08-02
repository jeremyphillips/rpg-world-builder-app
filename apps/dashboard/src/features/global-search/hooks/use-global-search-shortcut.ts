'use client'

import * as React from 'react'

type UseGlobalSearchShortcutOptions = {
  enabled?: boolean
  onOpen: () => void
}

/** Opens global search on Cmd+K / Ctrl+K when enabled. */
export function useGlobalSearchShortcut({
  enabled = true,
  onOpen,
}: UseGlobalSearchShortcutOptions) {
  React.useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.key !== 'k' && event.key !== 'K') return
      if (!event.metaKey && !event.ctrlKey) return

      event.preventDefault()
      onOpen()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onOpen])
}
