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

export const BUILDING_ORGANIZATIONS_TAB_HEADING = 'Organizations'
export const BUILDING_ORGANIZATIONS_TAB_DESCRIPTION =
  'Add owners, tenants, or operators associated with this building. You can link an existing organization or create a new one.'
export const BUILDING_ORGANIZATIONS_EMPTY_STATE_LABEL = 'No organization relationships added.'
export const BUILDING_ORGANIZATIONS_ADD_FIRST_LABEL = '+ Add organization relationship'
export const BUILDING_ORGANIZATIONS_COMPOSER_HEADING = 'Add organization relationship'
export const BUILDING_ORGANIZATIONS_DISCOVERY_HEADING = 'Choose organization'
export const BUILDING_ORGANIZATIONS_DISCOVERY_HELPER =
  'Select an existing organization or create a new one.'
export const BUILDING_ORGANIZATIONS_BRANCH_HEADING = 'New organization'
export const BUILDING_ORGANIZATIONS_BRANCH_HELPER =
  'This organization will be created when you create the building.'
export const BUILDING_ORGANIZATIONS_INTENT_PROMPT =
  'What relationship should this organization have with this building?'
export const BUILDING_ORGANIZATIONS_RELATIONSHIP_EYEBROW = 'Relationship'
export const BUILDING_ORGANIZATIONS_ORGANIZATION_EYEBROW = 'Organization'
export const BUILDING_ORGANIZATIONS_ORGANIZATION_CHANGE_LABEL = 'Change'
export const BUILDING_ORGANIZATIONS_SEARCH_LABEL = 'Search organizations'
export const BUILDING_ORGANIZATIONS_SEARCH_PLACEHOLDER = 'Search organizations…'
export const BUILDING_ORGANIZATIONS_CREATE_NEW_LABEL = '+ Create new organization'
export const BUILDING_ORGANIZATIONS_CHOOSE_EXISTING_LABEL = '← Choose existing organization'
export const BUILDING_ORGANIZATIONS_ADD_ANOTHER_LABEL = '+ Add another relationship'
export const BUILDING_ORGANIZATIONS_ADD_RELATIONSHIP_LABEL = 'Add relationship'
export const BUILDING_ORGANIZATIONS_UPDATE_RELATIONSHIP_LABEL = 'Update relationship'
export const BUILDING_ORGANIZATIONS_SELECT_LABEL = 'Select'
export const BUILDING_ORGANIZATIONS_PENDING_HEADING = 'Pending relationships'
export const BUILDING_ORGANIZATIONS_IN_PROGRESS_MESSAGE =
  'Finish or cancel the relationship you are adding.'
export const BUILDING_ORGANIZATIONS_NEW_BADGE_LABEL = 'New organization'
export const BUILDING_ORGANIZATIONS_UNAVAILABLE_NAME = 'Unavailable Organization'
export const BUILDING_ORGANIZATIONS_NEW_FALLBACK_NAME = 'New organization'
export const BUILDING_NEW_ORGANIZATION_FORM_ID = 'building-new-organization-draft'
export const BUILDING_ORGANIZATIONS_EDIT_ACTION_LABEL = 'Edit relationship'
export const BUILDING_ORGANIZATIONS_REMOVE_ACTION_LABEL = 'Remove relationship'
export const BUILDING_ORGANIZATIONS_OVERFLOW_LABEL = 'Relationship actions'
export const BUILDING_ORGANIZATIONS_LOADING_LABEL = 'Loading Organizations…'
export const BUILDING_ORGANIZATIONS_EMPTY_SEARCH_LABEL = 'No Organizations match this search.'
export const BUILDING_ORGANIZATIONS_LOAD_ERROR_TITLE = 'Could not load Organizations.'

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

export function resolveBuildingOrganizationTargetName(input: {
  organization: BuildingOrganizationRelationshipDraft['organization']
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
}): string {
  const target = input.organization
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

export function resolveBuildingOrganizationTargetDomainLabel(input: {
  organization: BuildingOrganizationRelationshipDraft['organization']
  plan: BuildingOrganizationDraftPlan
  existingOrganizations: readonly Organization[]
}): string {
  const target = input.organization
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
