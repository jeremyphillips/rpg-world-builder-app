import type { Organization } from '@rpg/contracts'
import { ActionButton } from '@rpg/ui'
import type { EntityAnatomyTrailing } from '@/features/content'

import { BuilderInventoryRemoveAction } from '../../components/builder/inventory/builder-inventory-remove-action'
import type {
  CharacterOrganizationMembershipEdge,
  CharacterRelationshipFieldContext,
  CharacterResidenceEdge,
  OrganizationMembershipSheetRow,
} from './character-relationship-field-context.types'
import {
  canEditOrganizationMembershipTitle,
  resolveOrganizationMembershipPresentation,
  resolveResidencePresentation,
  shouldOfferUnresolvedMembershipRemoval,
} from './character-relationship-presentation.lib'

function resolveOrganizationMembershipOrganization(
  membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
): Organization | null {
  const resolved =
    context.organizationsById.get(membership.organizationId) ??
    ('organization' in membership ? membership.organization : null)
  return resolved as Organization | null
}

function resolveApiOrganizationMembership(
  membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
): OrganizationMembershipSheetRow | undefined {
  const fromServer = context.resolvedMemberships?.find((item) => {
    if ('relationshipId' in membership && item.relationshipId === membership.relationshipId) {
      return true
    }
    return item.organizationId === membership.organizationId
  })
  if (fromServer) return fromServer

  const organization = resolveOrganizationMembershipOrganization(membership, context)
  if (!organization || !('relationshipId' in membership) || membership.revision === undefined) {
    return undefined
  }

  return {
    relationshipId: membership.relationshipId,
    revision: membership.revision,
    organizationId: membership.organizationId,
    ...(membership.membershipTitleId !== undefined
      ? { membershipTitleId: membership.membershipTitleId }
      : {}),
    ...(membership.titleReferenceStatus !== undefined
      ? { titleReferenceStatus: membership.titleReferenceStatus }
      : {}),
    ...(membership.title !== undefined ? { title: membership.title } : {}),
    ...('priority' in membership && membership.priority !== undefined
      ? { priority: membership.priority }
      : {}),
    organization,
  }
}

export function resolveOrganizationMembershipApiTrailing(
  membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
  index: number,
  onRemove: (edge: CharacterOrganizationMembershipEdge, index: number) => void,
): EntityAnatomyTrailing | undefined {
  const organization = resolveOrganizationMembershipOrganization(membership, context)
  const presentation = resolveOrganizationMembershipPresentation(membership, context)
  const label = typeof presentation.heading === 'string' ? presentation.heading : 'organization'
  const unavailable = !context.availableOrganizationIdSet.has(membership.organizationId)

  if (context.mode === 'draft') {
    return {
      kind: 'action',
      content: (
        <BuilderInventoryRemoveAction
          itemLabel={label}
          onRemove={() => onRemove(membership, index)}
        />
      ),
    }
  }

  if (canEditOrganizationMembershipTitle(membership, context, organization)) {
    return {
      kind: 'action',
      content: (
        <ActionButton
          action="edit"
          variant="ghost"
          size="icon"
          iconStep="md"
          aria-label={`Edit membership in ${label}`}
          onClick={() => {
            const resolved = resolveApiOrganizationMembership(membership, context)
            if (resolved) context.onEditMembership?.(resolved)
          }}
        />
      ),
    }
  }

  if (shouldOfferUnresolvedMembershipRemoval(membership, context, unavailable)) {
    return {
      kind: 'action',
      content: (
        <BuilderInventoryRemoveAction
          itemLabel={label}
          onRemove={() => {
            const resolved = resolveApiOrganizationMembership(membership, context)
            if (resolved) context.onRemoveUnresolvedMembership?.(resolved)
          }}
        />
      ),
    }
  }

  return undefined
}

export function resolveResidenceApiTrailing(
  edge: CharacterResidenceEdge,
  context: CharacterRelationshipFieldContext,
  index: number,
  onRemove: (edge: CharacterResidenceEdge, index: number) => void,
  disabled?: boolean,
): EntityAnatomyTrailing | undefined {
  const presentation = resolveResidencePresentation(edge, context)
  const label = typeof presentation.heading === 'string' ? presentation.heading : 'residence'

  if (disabled) return undefined

  return {
    kind: 'action',
    content: (
      <BuilderInventoryRemoveAction itemLabel={label} onRemove={() => onRemove(edge, index)} />
    ),
  }
}
