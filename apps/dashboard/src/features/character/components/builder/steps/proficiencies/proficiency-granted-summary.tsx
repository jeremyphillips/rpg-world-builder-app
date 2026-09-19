import type { GrantedProficiencySummaryRow } from '@rpg/contracts'
import { Heading, IconContainer, Text } from '@rpg/ui'

import { proficiencyCategoryIcons } from './proficiency-category-icons'
import {
  proficiencyGrantedSummaryCategoryLabelClasses,
  proficiencyGrantedSummaryClasses,
  proficiencyGrantedSummaryDividerClasses,
  proficiencyGrantedSummaryHeaderClasses,
  proficiencyGrantedSummaryRowClasses,
  proficiencyGrantedSummaryRowContentClasses,
  proficiencyGrantedSummaryRowsClasses,
  proficiencyGrantedSummarySourceGroupClasses,
  proficiencyGrantedSummarySourceLabelClasses,
  proficiencyGrantedSummaryValueLabelsClasses,
} from './proficiency-granted-summary.variants'

export const PROFICIENCY_GRANTED_SUMMARY_HEADING = 'Granted proficiencies' as const

export const PROFICIENCY_GRANTED_SUMMARY_SUBHEAD =
  'Automatically granted by your class, species, and origin.' as const

export type ProficiencyGrantedSummaryProps = {
  rows: readonly GrantedProficiencySummaryRow[]
}

export function ProficiencyGrantedSummary({ rows }: ProficiencyGrantedSummaryProps) {
  if (rows.length === 0) return null

  return (
    <section
      aria-labelledby="proficiency-granted-summary-heading"
      className={proficiencyGrantedSummaryClasses}
    >
      <div className={proficiencyGrantedSummaryHeaderClasses}>
        <Heading variant="subsection" as="h3" id="proficiency-granted-summary-heading">
          {PROFICIENCY_GRANTED_SUMMARY_HEADING}
        </Heading>
        <Text as="p" variant="muted" className="text-sm">
          {PROFICIENCY_GRANTED_SUMMARY_SUBHEAD}
        </Text>
      </div>

      <div className={proficiencyGrantedSummaryDividerClasses} role="presentation" aria-hidden />

      <div className={proficiencyGrantedSummaryRowsClasses}>
        {rows.map((row) => {
          const Icon = proficiencyCategoryIcons[row.kind]

          return (
            <div key={row.kind} className={proficiencyGrantedSummaryRowClasses}>
              <IconContainer shape="circle">
                <Icon aria-hidden />
              </IconContainer>

              <div className={proficiencyGrantedSummaryRowContentClasses}>
                <p className={proficiencyGrantedSummaryCategoryLabelClasses}>{row.label}</p>

                {row.sourceGroups.map((sourceGroup) => (
                  <div
                    key={`${row.kind}:${sourceGroup.sourceLabel}`}
                    className={proficiencyGrantedSummarySourceGroupClasses}
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
          )
        })}
      </div>
    </section>
  )
}
