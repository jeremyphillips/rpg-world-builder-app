import type { BuilderChoiceGrantedRow } from '@rpg/contracts'

import { ChoiceGrantedRow } from '../shared/choice-section/choice-granted-row'

export type ProficiencyGrantedRowProps = {
  row: BuilderChoiceGrantedRow
}

/** @deprecated Use {@link ChoiceGrantedRow} — fixed grants now render in section bodies. */
export function ProficiencyGrantedRow({ row }: ProficiencyGrantedRowProps) {
  return <ChoiceGrantedRow row={row} />
}
