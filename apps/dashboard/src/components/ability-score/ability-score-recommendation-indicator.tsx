'use client'

import { Star } from 'lucide-react'
import { useCallback, useState } from 'react'

import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@rpg/ui'

export type AbilityScoreRecommendationIndicatorProps = {
  label: string
}

export function AbilityScoreRecommendationIndicator({
  label,
}: AbilityScoreRecommendationIndicatorProps) {
  const [open, setOpen] = useState(false)

  const show = useCallback(() => setOpen(true), [])
  const hide = useCallback(() => setOpen(false), [])

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex size-control-action-compact items-center justify-center rounded-md',
              'text-muted-foreground transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label={label}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setOpen((current) => !current)
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                hide()
              }
            }}
            onClick={() => setOpen((current) => !current)}
          >
            <Star aria-hidden className="size-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
