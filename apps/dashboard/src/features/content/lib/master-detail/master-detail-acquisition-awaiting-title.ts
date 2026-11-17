import type { MasterDetailInlineTitle } from '../../components/master-detail/master-detail-inline-title'

/** True when add acquisition should stay with inline title until row ready or edit opens. */
export function masterDetailAcquisitionAwaitingTitleResolution(input: {
  lastAddedFieldId: string | null
  selectedFieldId: string
  inlineTitle: MasterDetailInlineTitle | undefined
  rowReady: boolean
}): boolean {
  const { inlineTitle, lastAddedFieldId, selectedFieldId, rowReady } = input
  if (lastAddedFieldId !== selectedFieldId) return false
  if (inlineTitle?.mode !== 'authored') return false
  return !rowReady || Boolean(inlineTitle.initialEdit)
}
