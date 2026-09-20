import type { RefObject } from 'react'

import type { GrantedProficiencySummaryRow } from '@rpg/contracts'
import { cn, Heading, IconContainer, Text } from '@rpg/ui'

import { proficiencyCategoryIcons } from './proficiency-category-icons'
import {
  sourceMeasureLabelClasses,
  useProficiencyGrantedSummarySourceWidth,
} from './use-proficiency-granted-summary-source-width'
import {
  proficiencyGrantedSummaryCategoryLabelClasses,
  proficiencyGrantedSummaryClasses,
  proficiencyGrantedSummaryDividerClasses,
  proficiencyGrantedSummaryHeaderClasses,
  proficiencyGrantedSummaryRowClasses,
  proficiencyGrantedSummaryRowDividerClasses,
  proficiencyGrantedSummaryRowsClasses,
  proficiencyGrantedSummarySourceGroupClasses,
  proficiencyGrantedSummarySourceGroupsClasses,
  proficiencyGrantedSummarySourceLabelClasses,
  proficiencyGrantedSummaryStackedSourceGroupClasses,
  proficiencyGrantedSummaryValueLabelsClasses,
} from './proficiency-granted-summary.variants'

export const PROFICIENCY_GRANTED_SUMMARY_HEADING = 'Granted proficiencies' as const

export const PROFICIENCY_GRANTED_SUMMARY_SUBHEAD =
  'Automatically granted by your class, species, and origin.' as const

export type ProficiencyGrantedSummaryProps = {
  rows: readonly GrantedProficiencySummaryRow[]
}

function ProficiencyGrantedSummaryRow({
  row,
  showDivider,
}: {
  row: GrantedProficiencySummaryRow
  showDivider: boolean
}) {
  const Icon = proficiencyCategoryIcons[row.kind]
  const hasMultipleSourceGroups = row.sourceGroups.length > 1

  return (
    <>
      <div className={proficiencyGrantedSummaryRowClasses}>
        <IconContainer shape="circle">
          <Icon aria-hidden />
        </IconContainer>

        <p className={proficiencyGrantedSummaryCategoryLabelClasses}>{row.label}</p>

        <div className={proficiencyGrantedSummarySourceGroupsClasses}>
          {row.sourceGroups.map((sourceGroup) => (
            <div
              key={`${row.kind}:${sourceGroup.sourceLabel}`}
              className={cn(
                proficiencyGrantedSummarySourceGroupClasses,
                hasMultipleSourceGroups && proficiencyGrantedSummaryStackedSourceGroupClasses,
              )}
            >
              <p className={proficiencyGrantedSummaryValueLabelsClasses}>
                {sourceGroup.valueLabels.join(' · ')}
              </p>
              <p className={proficiencyGrantedSummarySourceLabelClasses}>
                {sourceGroup.sourceLabel}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showDivider ? (
        <div
          className={proficiencyGrantedSummaryRowDividerClasses}
          role="presentation"
          aria-hidden
        />
      ) : null}
    </>
  )
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

  if (rows.length === 0) return null

  return (
    <section
      aria-labelledby="proficiency-granted-summary-heading"
      className={proficiencyGrantedSummaryClasses}
      style={sourceWidthStyle}
    >
      <ProficiencyGrantedSummarySourceWidthMeasure
        measureRef={measureRef}
        measureLabels={measureLabels}
      />
      <div className={proficiencyGrantedSummaryHeaderClasses}>
        <Heading variant="subsection" as="h3" id="proficiency-granted-summary-heading">
          {PROFICIENCY_GRANTED_SUMMARY_HEADING}
        </Heading>
        <Text as="p" variant="muted">
          {PROFICIENCY_GRANTED_SUMMARY_SUBHEAD}
        </Text>
      </div>

      <div className={proficiencyGrantedSummaryDividerClasses} role="presentation" aria-hidden />

      <div className={proficiencyGrantedSummaryRowsClasses}>
        {rows.map((row, index) => (
          <ProficiencyGrantedSummaryRow
            key={row.kind}
            row={row}
            showDivider={index < rows.length - 1}
          />
        ))}
      </div>
    </section>
  )
}
