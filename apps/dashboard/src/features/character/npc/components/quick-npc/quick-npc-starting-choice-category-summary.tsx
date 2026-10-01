import { formatStartingChoiceCategorySummary } from '../../lib/quick-npc/quick-npc-starting-choices.lib'

import { quickNpcStartingChoiceRowSummaryClasses } from './quick-npc-starting-choices.variants'

export type QuickNpcStartingChoiceCategorySummaryProps = {
  labels: readonly string[]
}

/** Collapsed category-row summary — deduped labels with bounded inline overflow. */
export function QuickNpcStartingChoiceCategorySummary({
  labels,
}: QuickNpcStartingChoiceCategorySummaryProps) {
  const summary = formatStartingChoiceCategorySummary(labels)
  if (!summary) return null

  return <span className={quickNpcStartingChoiceRowSummaryClasses}>{summary}</span>
}
