'use client'

import * as React from 'react'

type UseDismissOnOutsideInteractionOptions = {
  enabled: boolean
  containerRef: React.RefObject<HTMLElement | null>
  onDismiss: () => void
}

/** Closes an expanded topbar surface on outside click or Escape. */
export function useDismissOnOutsideInteraction({
  enabled,
  containerRef,
  onDismiss,
}: UseDismissOnOutsideInteractionOptions) {
  React.useEffect(() => {
    if (!enabled) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (containerRef.current?.contains(target)) return
      onDismiss()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onDismiss()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, enabled, onDismiss])
}
