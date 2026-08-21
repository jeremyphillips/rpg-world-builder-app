import {
  canReopenConnectionKindDecision,
  type LocationConnectionKindOption,
} from './location-connection-kind-options'

export function resolveConnectionKindDecisionPresentation(input: {
  kindOptions: readonly LocationConnectionKindOption[]
  selectedValue: string | null
  editingKind: boolean
  showKindStep: boolean
}): {
  canEditKind: boolean
  showKindField: boolean
  showKindSummary: boolean
} {
  const canEditKind = canReopenConnectionKindDecision(input.kindOptions)
  const kindDecisionComplete = input.showKindStep && Boolean(input.selectedValue)
  const showKindField =
    input.showKindStep &&
    (!kindDecisionComplete || input.editingKind || (kindDecisionComplete && !canEditKind))
  const showKindSummary =
    input.showKindStep && canEditKind && kindDecisionComplete && !input.editingKind

  return { canEditKind, showKindField, showKindSummary }
}
