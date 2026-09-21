import type { GrantedProficiencySummaryRow } from '@rpg/contracts'

export const BUILDER_FACT_SUMMARY_SOURCE_WIDTH_VAR = '--builder-fact-summary-source-width' as const

/** @deprecated Use {@link BUILDER_FACT_SUMMARY_SOURCE_WIDTH_VAR}. */
export const PROFICIENCY_GRANTED_SUMMARY_SOURCE_WIDTH_VAR = BUILDER_FACT_SUMMARY_SOURCE_WIDTH_VAR

/** Unique source labels across all granted summary rows. */
export function collectBuilderFactSummarySourceLabels(
  rows: readonly GrantedProficiencySummaryRow[],
): string[] {
  return [
    ...new Set(
      rows.flatMap((row) => row.sourceGroups.map((sourceGroup) => sourceGroup.sourceLabel)),
    ),
  ]
}

export const collectProficiencyGrantedSummarySourceLabels = collectBuilderFactSummarySourceLabels

export function measureMaxElementWidth(elements: readonly HTMLElement[]): number {
  return elements.reduce((maxWidth, element) => {
    const width = element.getBoundingClientRect().width
    return width > maxWidth ? width : maxWidth
  }, 0)
}
