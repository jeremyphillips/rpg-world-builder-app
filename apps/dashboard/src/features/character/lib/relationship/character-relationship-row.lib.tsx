import { SquarePen } from 'lucide-react'

import type { Organization, OrganizationReferenceResolution } from '@rpg/contracts'
import { Button } from '@rpg/ui'
import type { EntityAnatomyTrailing } from '@/features/content'

import { BuilderInventoryRemoveAction } from '../../components/builder/inventory/builder-inventory-remove-action'
import type {
  CharacterOrganizationMembershipEdge,
  CharacterRelationshipFieldContext,
  CharacterResidenceEdge,
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Edit membership in ${label}`}
          onClick={() => context.onEditMembership?.(membership as OrganizationReferenceResolution)}
        >
          <SquarePen aria-hidden className="size-4" />
        </Button>
      ),
    }
  }

  if (shouldOfferUnresolvedMembershipRemoval(membership, context, unavailable)) {
    return {
      kind: 'action',
      content: (
        <BuilderInventoryRemoveAction
          itemLabel={label}
          onRemove={() =>
            context.onRemoveUnresolvedMembership?.(membership as OrganizationReferenceResolution)
          }
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
