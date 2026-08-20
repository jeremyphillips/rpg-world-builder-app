import type { DetailOverflowAction } from '../../detail/row/detail-overflow-menu.client'
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

export const RELATIONSHIP_OVERFLOW_RESOLVING_LABEL = 'Checking availability…'

export function isRelationshipMutationOverflowActionId(
  actionId: RelationshipOverflowActionId,
): actionId is (typeof MUTATION_ACTION_IDS)[number] {
  return (MUTATION_ACTION_IDS as readonly RelationshipOverflowActionId[]).includes(actionId)
}

function isAlternativeMutationVisible(operation?: RelationshipOperationState): boolean {
  return Boolean(operation?.supported && operation.availability !== 'unavailable')
}

function isSupportedOperationVisible(operation?: RelationshipOperationState): boolean {
  return Boolean(operation?.supported)
}

function pushAlternativeMutationAction(
  actions: DetailOverflowAction[],
  input: {
    id: RelationshipOverflowActionId
    operation?: RelationshipOperationState
    label: string
    onSelect?: () => void
  },
): void {
  if (!isAlternativeMutationVisible(input.operation) || !input.onSelect) {
    return
  }

  actions.push({
    id: input.id,
    label: input.operation?.isResolving
      ? `${input.label} — ${RELATIONSHIP_OVERFLOW_RESOLVING_LABEL}`
      : input.label,
    disabled: input.operation?.isResolving,
    onSelect: input.onSelect,
  })
}

/** Domain-agnostic: operation IDs + capability states + labels + handlers only. */
// fallow-ignore-next-line complexity
export function buildRelationshipOverflowActions(input: {
  capabilities: RelationshipMutationCapabilities
  labels: Partial<Record<RelationshipOverflowActionId, string>>
  handlers: Partial<Record<RelationshipOverflowActionId, () => void>>
}): DetailOverflowAction[] {
  const actions: DetailOverflowAction[] = []

  if (isSupportedOperationVisible(input.capabilities.view) && input.handlers.view) {
    actions.push({
      id: 'view',
      label: input.labels.view ?? 'View',
      onSelect: input.handlers.view,
    })
  }

  pushAlternativeMutationAction(actions, {
    id: 'changeKind',
    operation: input.capabilities.changeKind,
    label: input.labels.changeKind ?? 'Change connection type',
    onSelect: input.handlers.changeKind,
  })

  pushAlternativeMutationAction(actions, {
    id: 'changeTarget',
    operation: input.capabilities.changeTarget,
    label: input.labels.changeTarget ?? 'Change location',
    onSelect: input.handlers.changeTarget,
  })

  pushAlternativeMutationAction(actions, {
    id: 'replaceSubject',
    operation: input.capabilities.replaceSubject,
    label: input.labels.replaceSubject ?? 'Replace',
    onSelect: input.handlers.replaceSubject,
  })

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
