'use client'

import { cn } from '../../lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.client'
import { collectionSummaryCounterVariants } from './collection-summary.variants'
import type { CollectionSummaryCellProps, CollectionSummaryItem } from './collection-summary.types'

const DEFAULT_EMPTY_LABEL = '—'
const DEFAULT_MAX_VISIBLE_ITEMS = 4

function formatCountLabel(count: number, singularLabel: string, pluralLabel: string): string {
  return count === 1 ? `1 ${singularLabel}` : `${count} ${pluralLabel}`
}

function resolveVisibleItems(
  items: CollectionSummaryItem[],
  maxVisibleItems: number,
  sortItems: boolean,
): { visible: CollectionSummaryItem[]; hiddenCount: number } {
  const ordered = sortItems
    ? [...items].sort((left, right) => left.label.localeCompare(right.label))
    : items
  const visible = ordered.slice(0, maxVisibleItems)
  return { visible, hiddenCount: items.length - visible.length }
}

function buildAccessibleSummary(
  items: CollectionSummaryItem[],
  visible: CollectionSummaryItem[],
  hiddenCount: number,
  singularLabel: string,
  pluralLabel: string,
): string {
  const count = items.length
  const noun = count === 1 ? singularLabel : pluralLabel
  const names = visible.map((item) => item.label).join(', ')
  const suffix = hiddenCount > 0 ? `, and ${hiddenCount} more` : ''
  return `${count} ${noun}: ${names}${suffix}`
}

/**
 * Compact collection count for catalog tables. The trigger shows the numeric
 * count; hover and keyboard focus reveal a bounded read-only name list. Promote
 * to a popover when entries need links, grouping, scrolling, or rich metadata
 * (`secondary`, `href`).
 */
export function CollectionSummaryCell({
  items,
  singularLabel,
  pluralLabel,
  emptyLabel = DEFAULT_EMPTY_LABEL,
  maxVisibleItems = DEFAULT_MAX_VISIBLE_ITEMS,
  sortItems = false,
}: CollectionSummaryCellProps) {
  if (items.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }

  const { visible, hiddenCount } = resolveVisibleItems(items, maxVisibleItems, sortItems)
  const heading = formatCountLabel(items.length, singularLabel, pluralLabel)
  const ariaLabel = buildAccessibleSummary(items, visible, hiddenCount, singularLabel, pluralLabel)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            className={cn(collectionSummaryCounterVariants())}
          >
            {items.length}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-1 px-3 py-2">
          <p className="font-medium">{heading}</p>
          <ul className="space-y-0.5 text-sm">
            {visible.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
            {hiddenCount > 0 ? (
              <li className="text-muted-foreground">+{hiddenCount} more</li>
            ) : null}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
