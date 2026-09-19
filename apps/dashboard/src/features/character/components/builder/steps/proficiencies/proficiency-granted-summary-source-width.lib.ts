import type { GrantedProficiencySummaryRow } from '@rpg/contracts'

export const PROFICIENCY_GRANTED_SUMMARY_SOURCE_WIDTH_VAR =
  '--proficiency-granted-summary-source-width' as const

/** Unique source labels across all granted summary rows. */
export function collectProficiencyGrantedSummarySourceLabels(
  rows: readonly GrantedProficiencySummaryRow[],
): string[] {
  return [
    ...new Set(
      rows.flatMap((row) => row.sourceGroups.map((sourceGroup) => sourceGroup.sourceLabel)),
    ),
  ]
}

export function measureMaxElementWidth(elements: readonly HTMLElement[]): number {
  return elements.reduce((maxWidth, element) => {
    const width = element.getBoundingClientRect().width
    return width > maxWidth ? width : maxWidth
  }, 0)
}
