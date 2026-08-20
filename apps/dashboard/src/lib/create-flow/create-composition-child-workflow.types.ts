export type CreateCompositionChildWorkflowCommitTarget =
  | Readonly<{ kind: 'action' }>
  | Readonly<{ kind: 'form'; formId: string }>

export type CreateCompositionChildWorkflowView = Readonly<{
  active: boolean
  canCommit: boolean
  commitLabel: string
  commitTarget: CreateCompositionChildWorkflowCommitTarget
}> | null

export function areCreateCompositionChildWorkflowViewsEqual(
  previous: CreateCompositionChildWorkflowView,
  next: CreateCompositionChildWorkflowView,
): boolean {
  if (previous === next) return true
  if (previous == null || next == null) return previous === next
  if (
    previous.active !== next.active ||
    previous.canCommit !== next.canCommit ||
    previous.commitLabel !== next.commitLabel
  ) {
    return false
  }
  if (previous.commitTarget.kind !== next.commitTarget.kind) return false
  if (previous.commitTarget.kind === 'form' && next.commitTarget.kind === 'form') {
    return previous.commitTarget.formId === next.commitTarget.formId
  }
  return true
}
