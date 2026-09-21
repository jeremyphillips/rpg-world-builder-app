import type { RefObject } from 'react'

import type { GrantedProficiencySummaryRow } from '@rpg/contracts'

import { BuilderFactSummary } from '../shared/fact-summary/builder-fact-summary'
import { sourceMeasureLabelClasses } from '../shared/fact-summary/use-builder-fact-summary-source-width'
import { proficiencyCategoryIcons } from './proficiency-category-icons'
import { useProficiencyGrantedSummarySourceWidth } from './use-proficiency-granted-summary-source-width'

export const PROFICIENCY_GRANTED_SUMMARY_HEADING = 'Granted proficiencies' as const

export const PROFICIENCY_GRANTED_SUMMARY_SUBHEAD =
  'Automatically granted by your class, species, and origin.' as const

export type ProficiencyGrantedSummaryProps = {
  rows: readonly GrantedProficiencySummaryRow[]
}

function ProficiencyGrantedSummarySourceWidthMeasure({
  measureRef,
  measureLabels,
}: {
  measureRef: RefObject<HTMLDivElement | null>
  measureLabels: readonly string[]
}) {
  if (measureLabels.length === 0) return null

  return (
    <div
      ref={measureRef}
      aria-hidden
      className="pointer-events-none absolute h-0 overflow-hidden opacity-0"
    >
      {measureLabels.map((label) => (
        <span key={label} data-source-measure className={sourceMeasureLabelClasses}>
          {label}
        </span>
      ))}
    </div>
  )
}

export function ProficiencyGrantedSummary({ rows }: ProficiencyGrantedSummaryProps) {
  const { sourceWidthStyle, measureLabels, measureRef } =
    useProficiencyGrantedSummarySourceWidth(rows)

  return (
    <BuilderFactSummary
      heading={PROFICIENCY_GRANTED_SUMMARY_HEADING}
      subhead={PROFICIENCY_GRANTED_SUMMARY_SUBHEAD}
      grantedRows={rows}
      showSourceColumn
      sourceWidthStyle={sourceWidthStyle}
      categoryIcons={proficiencyCategoryIcons}
      measureSlot={
        <ProficiencyGrantedSummarySourceWidthMeasure
          measureRef={measureRef}
          measureLabels={measureLabels}
        />
      }
    />
  )
}
