export type AddPendingWorkflowMode = 'add' | 'pending'

export type DisclosureChoice = Readonly<{
  value: string
  label: string
  disabled?: boolean
  disabledReason?: string
}>

export function resolveAddPendingMode(input: {
  requestedMode: AddPendingWorkflowMode
  hasPendingItems: boolean
}): AddPendingWorkflowMode {
  return input.hasPendingItems ? input.requestedMode : 'add'
}

export function resolveDisclosureChoicePresentation(
  choices: readonly DisclosureChoice[],
  selectedValue: string | null,
): {
  eligible: readonly DisclosureChoice[]
  showRadios: boolean
  resolvedValue: string | null
} {
  const eligible = choices.filter((choice) => !choice.disabled)
  return {
    eligible,
    showRadios: eligible.length > 1,
    resolvedValue: eligible.length === 1 ? (eligible[0]?.value ?? null) : selectedValue,
  }
}
