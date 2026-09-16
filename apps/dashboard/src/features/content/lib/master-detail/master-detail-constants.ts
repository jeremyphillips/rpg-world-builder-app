import { getTermSentenceForm, withArticle } from '@rpg/contracts'

import type { MasterDetailItemNounTerm } from './master-detail-item-noun'

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

export function masterDetailUnnamedItemTitle(itemNoun: MasterDetailItemNounTerm): string {
  return `Unnamed ${itemNoun.label}`
}

export function masterDetailItemTitle(
  title: string | undefined,
  itemNoun: MasterDetailItemNounTerm,
): string {
  const trimmed = title?.trim() ?? ''
  return trimmed || masterDetailUnnamedItemTitle(itemNoun)
}
