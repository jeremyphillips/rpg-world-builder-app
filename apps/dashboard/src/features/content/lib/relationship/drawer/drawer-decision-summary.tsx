import {
  DecisionSummaryPanel,
  SELECTION_SUMMARY_DEFAULT_EYEBROW,
  type DecisionSummaryPanelProps,
} from '@rpg/ui'

export type DrawerDecisionSummaryProps = Omit<DecisionSummaryPanelProps, 'chrome'> & {
  eyebrow?: string
}

/** Relationship sequenced drawers — card chrome with default Selections eyebrow. */
export function DrawerDecisionSummary({
  eyebrow = SELECTION_SUMMARY_DEFAULT_EYEBROW,
  ...props
}: DrawerDecisionSummaryProps) {
  return <DecisionSummaryPanel chrome="card" eyebrow={eyebrow} {...props} />
}
