'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { attentionFrameVariants } from './attention-frame.variants'

export const ATTENTION_FRAME_DURATION_MS = 1500
export const ATTENTION_FRAME_REDUCED_MOTION_HOLD_MS = 100

export type AttentionFrameProps = React.ComponentPropsWithoutRef<'div'> & {
  /** When true, applies a brief primary border/ring attention treatment. */
  active?: boolean
  /** Called after the attention treatment completes; caller typically clears `active`. */
  onAttentionComplete?: () => void
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Wraps content with a brief focus/attention border when `active` is true.
 * Reusable for dependent-choice reveals, form focus handoff, and similar UX.
 */
export function AttentionFrame({
  active = false,
  onAttentionComplete,
  className,
  children,
  ...props
}: AttentionFrameProps) {
  React.useEffect(() => {
    if (!active || !onAttentionComplete) return

    const duration = prefersReducedMotion()
      ? ATTENTION_FRAME_REDUCED_MOTION_HOLD_MS
      : ATTENTION_FRAME_DURATION_MS

    const timer = window.setTimeout(onAttentionComplete, duration)
    return () => window.clearTimeout(timer)
  }, [active, onAttentionComplete])

  return (
    <div className={cn(attentionFrameVariants({ active }), className)} {...props}>
      {children}
    </div>
  )
}
