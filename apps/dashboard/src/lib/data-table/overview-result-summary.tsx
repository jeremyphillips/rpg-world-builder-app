import { Button, InlineMetadata } from '@rpg/ui'

import { formatResultCount } from './format-result-count.lib'
export type ResultSummarySupplement = {
  label: string
  action?: {
    label: string
    accessibleName?: string
    onClick: () => void
  }
}

export type ResultSummaryModel = {
  visibleCount: number
  supplements?: readonly ResultSummarySupplement[]
}

export type ResultSummaryProps = ResultSummaryModel & {
  /** Admin tables that name a different noun. Not a visibility supplement. */
  primaryLabel?: string
}

/** Shared result count with optional domain visibility supplements. */
export function ResultSummary({ visibleCount, primaryLabel, supplements }: ResultSummaryProps) {
  const countLabel = primaryLabel ?? formatResultCount(visibleCount)
  const supplementItems = (supplements ?? []).flatMap((supplement, index) => {
    const labelItem = (
      <InlineMetadata.Item key={`label-${index}`}>{supplement.label}</InlineMetadata.Item>
    )
    if (!supplement.action) return [labelItem]

    const { label, accessibleName, onClick } = supplement.action
    return [
      labelItem,
      <InlineMetadata.Item key={`action-${index}`}>
        <Button
          type="button"
          variant="text"
          size="sm"
          aria-label={accessibleName ?? label}
          onClick={onClick}
        >
          {label}
        </Button>
      </InlineMetadata.Item>,
    ]
  })

  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-y-1 text-style-caption"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <InlineMetadata role="supporting" density="compact">
        <InlineMetadata.Item key="count">
          <span className="tabular-nums">{countLabel}</span>
        </InlineMetadata.Item>
        {supplementItems}
      </InlineMetadata>
    </div>
  )
}
