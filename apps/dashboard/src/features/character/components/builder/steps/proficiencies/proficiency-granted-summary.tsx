import type { GrantedProficiencySummaryRow } from '@rpg/contracts'

import { BuilderFactSummary } from '../shared/fact-summary/builder-fact-summary'
import { proficiencyCategoryIcons } from './proficiency-category-icons'

export const PROFICIENCY_GRANTED_SUMMARY_HEADING = 'Granted proficiencies' as const

export const PROFICIENCY_GRANTED_SUMMARY_SUBHEAD = 'Automatically granted by your class.' as const

export type ProficiencyGrantedSummaryProps = {
  rows: readonly GrantedProficiencySummaryRow[]
}

export function ProficiencyGrantedSummary({ rows }: ProficiencyGrantedSummaryProps) {
  return (
    <BuilderFactSummary
      heading={PROFICIENCY_GRANTED_SUMMARY_HEADING}
      subhead={PROFICIENCY_GRANTED_SUMMARY_SUBHEAD}
      grantedRows={rows}
      showSourceColumn
      categoryIcons={proficiencyCategoryIcons}
    />
  )
}
