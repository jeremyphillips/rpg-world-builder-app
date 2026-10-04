import { Check, TriangleAlert } from 'lucide-react'
import { AlertCircle } from 'lucide-react'

import {
  Badge,
  InlineInactiveStatus,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type BadgeSize,
  type ContentCardDensity,
} from '@rpg/ui'

import type { EntitySummaryStatusItem } from './entity-summary-status.types'
import { entitySummaryStatusVariants } from './entity-summary.variants'

function resolveStatusBadgeSize(density: ContentCardDensity): BadgeSize {
  return density === 'compact' ? 'sm' : 'md'
}

function resolveStatusLeadingIcon(icon: 'check' | 'warning' | undefined) {
  if (icon === 'check') return <Check aria-hidden />
  if (icon === 'warning') return <TriangleAlert aria-hidden />
  return undefined
}

export function EntitySummaryStatusItemView({
  item,
  density,
}: {
  item: EntitySummaryStatusItem
  density: ContentCardDensity
}) {
  switch (item.kind) {
    case 'badge': {
      const badge = (
        <Badge
          appearance={item.appearance}
          tone={item.tone}
          size={resolveStatusBadgeSize(density)}
          leadingIcon={resolveStatusLeadingIcon(item.leadingIcon)}
          title={item.tooltip ? undefined : item.title}
        >
          {item.label}
        </Badge>
      )

      if (!item.tooltip) {
        return badge
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">{badge}</span>
            </TooltipTrigger>
            <TooltipContent>{item.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    case 'text':
      return (
        <div
          className={entitySummaryStatusVariants({
            density,
            tone: item.variant === 'warning' ? 'warning' : 'muted',
          })}
        >
          {item.label}
        </div>
      )
    case 'inactive':
      return <InlineInactiveStatus label={item.label} />
    case 'validationError':
      return (
        <span className="inline-flex items-center gap-1">
          <AlertCircle className="size-3.5 shrink-0 text-destructive" aria-hidden />
          <span className="sr-only">Has validation errors</span>
        </span>
      )
    default: {
      const _exhaustive: never = item
      return _exhaustive
    }
  }
}
