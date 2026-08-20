export type AddPendingWorkflowMode = 'add' | 'pending'

export function resolveAddPendingMode(input: {
  requestedMode: AddPendingWorkflowMode
  hasPendingItems: boolean
  allowEmptyResting?: boolean
}): AddPendingWorkflowMode {
  if (input.hasPendingItems) return input.requestedMode
  if (input.allowEmptyResting && input.requestedMode === 'pending') return 'pending'
  return 'add'
}
