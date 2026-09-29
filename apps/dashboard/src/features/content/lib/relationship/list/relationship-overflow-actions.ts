import { createElement } from 'react'

import { ActionIcon, type ActionIconVerb } from '@rpg/ui'

import type { DetailOverflowAction } from '../../detail/detail-overflow-menu'
import type {
  RelationshipMutationCapabilities,
  RelationshipOperationState,
} from '../core/relationship-mutation-capabilities'

export type RelationshipOverflowActionId =
  | 'view'
  | 'changeKind'
  | 'changeTarget'
  | 'replaceSubject'
  | 'remove'

const OVERFLOW_MENU_ICON_STEP = 'md' as const

const RELATIONSHIP_OVERFLOW_ACTION_ICON: Record<RelationshipOverflowActionId, ActionIconVerb> = {
  view: 'view',
  changeKind: 'edit',
  changeTarget: 'waypoints',
  replaceSubject: 'waypoints',
  remove: 'delete',
}

function relationshipOverflowActionIcon(id: RelationshipOverflowActionId) {
  return createElement(ActionIcon, {
    action: RELATIONSHIP_OVERFLOW_ACTION_ICON[id],
    step: OVERFLOW_MENU_ICON_STEP,
  })
}

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
    label?: string
    onSelect?: () => void
  },
): void {
  if (!input.label || !isAlternativeMutationVisible(input.operation) || !input.onSelect) {
    return
  }

  actions.push({
    id: input.id,
    label: input.operation?.isResolving
      ? `${input.label} — ${RELATIONSHIP_OVERFLOW_RESOLVING_LABEL}`
      : input.label,
    icon: relationshipOverflowActionIcon(input.id),
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
      icon: relationshipOverflowActionIcon('view'),
      onSelect: input.handlers.view,
    })
  }

  pushAlternativeMutationAction(actions, {
    id: 'changeKind',
    operation: input.capabilities.changeKind,
    label: input.labels.changeKind,
    onSelect: input.handlers.changeKind,
  })

  pushAlternativeMutationAction(actions, {
    id: 'changeTarget',
    operation: input.capabilities.changeTarget,
    label: input.labels.changeTarget,
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
      icon: relationshipOverflowActionIcon('remove'),
      destructive: true,
      onSelect: input.handlers.remove,
    })
  }

  return actions
}
