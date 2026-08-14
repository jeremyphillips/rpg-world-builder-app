export type AddPendingWorkflowMode = 'add' | 'pending'

export function resolveAddPendingMode(input: {
  requestedMode: AddPendingWorkflowMode
  hasPendingItems: boolean
}): AddPendingWorkflowMode {
  return input.hasPendingItems ? input.requestedMode : 'add'
}
