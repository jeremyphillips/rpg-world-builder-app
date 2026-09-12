import { getTermSentenceForm, withArticle } from '@rpg/contracts'

import type { MasterDetailItemNounTerm } from './master-detail-item-noun'

export const MASTER_DETAIL_UNSELECTED_ROW_ERROR_MESSAGE =
  'Some items have validation errors. Select the marked rows in the list to fix them.'

export function masterDetailItemNounLabel(itemNoun: MasterDetailItemNounTerm): string {
  return getTermSentenceForm(itemNoun, 1)
}

export function masterDetailEmptyListLabel(itemNoun: MasterDetailItemNounTerm): string {
  return `No ${getTermSentenceForm(itemNoun, 2)} added.`
}

export function masterDetailEmptySelectionHeading(itemNoun: MasterDetailItemNounTerm): string {
  return `Add ${withArticle(getTermSentenceForm(itemNoun, 1))} to begin`
}

export function masterDetailEmptySelectionSubhead(itemNoun: MasterDetailItemNounTerm): string {
  const singular = getTermSentenceForm(itemNoun, 1)
  const plural = getTermSentenceForm(itemNoun, 2)
  return `Select ${withArticle(singular)} to edit once ${plural} have been added.`
}
