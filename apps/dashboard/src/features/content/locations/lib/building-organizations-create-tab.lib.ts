import {
  getOrganizationDomainLabel,
  getOrganizationLocationConnectionLabel,
  type Organization,
} from '@rpg/contracts'

import type { EntitySummaryModel } from '../../lib/entity/entity-summary.types'
import type {
  BuildingOrganizationDraftPlan,
  BuildingOrganizationRelationshipDraft,
} from './building-organization-create-drafts'

export const BUILDING_ORGANIZATIONS_ADD_DESCRIPTION =
  'Search or create an organization to associate with this building.'
export const BUILDING_ORGANIZATIONS_SEARCH_LABEL = 'Search organizations'
export const BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER = 'Search organizations…'
export const BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL = '+ Create new organization'
export const BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL = '← Choose existing organization'
export const BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL = '+ Add another organization'
export const BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL = 'Add relationship'
export const BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL = 'Update relationship'
export const BUILDING_ORGANIZATIONS_PENDING_HEADING = 'Pending relationships'
export const BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE =
  'Finish or cancel the relationship you are adding.'
export const BUILDING_ORGANIZATIONS_NEW_BADGE_LABEL = 'New Organization'
export const BUILDING_ORGANIZATIONS_UNAVAILABLE_NAME = 'Unavailable Organization'
export const BUILDING_ORGANIZATIONS_NEW_FALLBACK_NAME = 'New Organization'
export const BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL = 'Edit relationship'
export const BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL = 'Remove relationship'
export const BUILDING_ORGANIZATIONS_OVERFLOW_LABEL = 'Relationship actions'
export const BUILDING_ORGANIZATIONS_LOADING_LABEL = 'Loading Organizations…'
export const BUILDING_ORGANIZATIONS_EMPTY_SEARCH_LABEL = 'No Organizations match this search.'
export const BUILDING_ORGANIZATIONS_LOAD_ERROR_TITLE = 'Could not load Organizations.'

const DISCOVERY_ITEM_PREFIX = 'discovery:'
const PENDING_ITEM_PREFIX = 'pending:'

export function buildingOrganizationDiscoveryItemId(organizationId: string): string {
  return `${DISCOVERY_ITEM_PREFIX}${organizationId}`
}

export function buildingOrganizationPendingItemId(draftId: string): string {
  return `${PENDING_ITEM_PREFIX}${draftId}`
}

export function parseBuildingOrganizationDiscoveryItemId(itemId: string): string | null {
  return itemId.startsWith(DISCOVERY_ITEM_PREFIX)
    ? itemId.slice(DISCOVERY_ITEM_PREFIX.length)
    : null
}

export function parseBuildingOrganizationPendingItemId(itemId: string): string | null {
  return itemId.startsWith(PENDING_ITEM_PREFIX) ? itemId.slice(PENDING_ITEM_PREFIX.length) : null
}

export function relationshipOrganizationName(input: {
  relationship: BuildingOrganizationRelationshipDraft
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
}): string {
  const target = input.relationship.organization
  if (target.kind === 'existing') {
    return (
      input.existingOrganizations.find((item) => item.id === target.organizationId)?.name ??
      BUILDING_ORGANIZATIONS_UNAVAILABLE_NAME
    )
  }
  return (
    input.plan.organizations.find((item) => item.draftOrganizationId === target.draftOrganizationId)
      ?.values.name ?? BUILDING_ORGANIZATIONS_NEW_FALLBACK_NAME
  )
}

export function relationshipOrganizationDomainLabel(input: {
  relationship: BuildingOrganizationRelationshipDraft
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
}): string {
  const target = input.relationship.organization
  if (target.kind === 'existing') {
    const organization = input.existingOrganizations.find(
      (item) => item.id === target.organizationId,
    )
    return organization ? getOrganizationDomainLabel(organization.organizationDomain) : ''
  }
  const draft = input.plan.organizations.find(
    (item) => item.draftOrganizationId === target.draftOrganizationId,
  )
  return draft ? getOrganizationDomainLabel(draft.values.organizationDomain) : ''
}

export function buildBuildingOrganizationPendingEntity(input: {
  relationship: BuildingOrganizationRelationshipDraft
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
}): EntitySummaryModel {
  const domainLabel = relationshipOrganizationDomainLabel(input)
  const relationshipLabel = getOrganizationLocationConnectionLabel(input.relationship.kind)
  return {
    heading: relationshipOrganizationName(input),
    classification: domainLabel ? `${domainLabel} · ${relationshipLabel}` : relationshipLabel,
    ...(input.relationship.organization.kind === 'new'
      ? {
          status: [
            {
              kind: 'badge' as const,
              label: BUILDING_ORGANIZATIONS_NEW_BADGE_LABEL,
              tone: 'info' as const,
            },
          ],
        }
      : {}),
  }
}
