import type { RelationshipOverflowAction } from './relationship-overflow-menu.client'
import type {
  RelationshipMutationCapabilities,
  RelationshipOperationState,
} from './relationship-alternatives'

export type RelationshipOverflowActionId =
  | 'view'
  | 'changeKind'
  | 'changeTarget'
  | 'replaceSubject'
  | 'remove'

const MUTATION_ACTION_IDS = [
  'changeKind',
  'changeTarget',
  'replaceSubject',
] as const satisfies readonly RelationshipOverflowActionId[]

export function isRelationshipMutationOverflowActionId(
  actionId: RelationshipOverflowActionId,
): actionId is (typeof MUTATION_ACTION_IDS)[number] {
  return (MUTATION_ACTION_IDS as readonly RelationshipOverflowActionId[]).includes(actionId)
}

function isAlternativeMutationVisible(operation?: RelationshipOperationState): boolean {
  return Boolean(operation?.supported && operation.availability === 'available')
}

function isSupportedOperationVisible(operation?: RelationshipOperationState): boolean {
  return Boolean(operation?.supported)
}

/** Domain-agnostic: operation IDs + capability states + labels + handlers only. */
// fallow-ignore-next-line complexity
export function buildRelationshipOverflowActions(input: {
  capabilities: RelationshipMutationCapabilities
  labels: Partial<Record<RelationshipOverflowActionId, string>>
  handlers: Partial<Record<RelationshipOverflowActionId, () => void>>
}): RelationshipOverflowAction[] {
  const actions: RelationshipOverflowAction[] = []

  if (isSupportedOperationVisible(input.capabilities.view) && input.handlers.view) {
    actions.push({
      id: 'view',
      label: input.labels.view ?? 'View',
      onSelect: input.handlers.view,
    })
  }

  if (isAlternativeMutationVisible(input.capabilities.changeKind) && input.handlers.changeKind) {
    actions.push({
      id: 'changeKind',
      label: input.labels.changeKind ?? 'Change connection type',
      onSelect: input.handlers.changeKind,
    })
  }

  if (
    isAlternativeMutationVisible(input.capabilities.changeTarget) &&
    input.handlers.changeTarget
  ) {
    actions.push({
      id: 'changeTarget',
      label: input.labels.changeTarget ?? 'Change location',
      onSelect: input.handlers.changeTarget,
    })
  }

  if (
    isAlternativeMutationVisible(input.capabilities.replaceSubject) &&
    input.handlers.replaceSubject
  ) {
    actions.push({
      id: 'replaceSubject',
      label: input.labels.replaceSubject ?? 'Replace',
      onSelect: input.handlers.replaceSubject,
    })
  }

  if (isSupportedOperationVisible(input.capabilities.remove) && input.handlers.remove) {
    actions.push({
      id: 'remove',
      label: input.labels.remove ?? 'Remove',
      destructive: true,
      onSelect: input.handlers.remove,
    })
  }

  return actions
}
