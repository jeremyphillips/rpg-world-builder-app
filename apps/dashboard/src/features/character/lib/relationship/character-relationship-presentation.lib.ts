import type { ReactNode } from 'react'

import {
  getOrganizationDomainLabel,
  resolveLocationClassificationDisplay,
  type Organization,
} from '@rpg/contracts'
import type { EntitySummaryStatusItem } from '@/features/content'

import { ROUTES } from '@/app/routes'
import {
  UNAVAILABLE_LOCATION_LABEL,
  UNAVAILABLE_ORGANIZATION_LABEL,
} from '../display/character-display'
import type {
  CharacterOrganizationMembershipEdge,
  CharacterRelationshipFieldContext,
  CharacterResidenceEdge,
  OrganizationMembershipFormRow,
  OrganizationMembershipSheetRow,
} from './character-relationship-field-context.types'

type BadgeStatusItem = Extract<EntitySummaryStatusItem, { kind: 'badge' }>

export type CharacterRelationshipRowPresentation = {
  heading: ReactNode
  classification?: string
  status?: readonly EntitySummaryStatusItem[]
  toolbarAriaLabel: string
  headingHref?: string
}

function organizationMembershipTitle(
  membership: CharacterOrganizationMembershipEdge,
  organization: Organization | null | undefined,
): string | null {
  if (membership.title) return membership.title
  const domain = organization?.organizationDomain
  return domain ? getOrganizationDomainLabel(domain) : null
}

function resolveOrganizationMembershipOrganization(
  membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
): Organization | null {
  const resolved =
    context.organizationsById.get(membership.organizationId) ??
    ('organization' in membership ? membership.organization : null)
  return resolved as Organization | null
}

function resolveOrganizationMembershipLabel(
  organizationId: string,
  organization: Organization | null,
  context: CharacterRelationshipFieldContext,
): string {
  if (organization?.name) return organization.name
  return context.mode === 'draft' ? organizationId : UNAVAILABLE_ORGANIZATION_LABEL
}

function buildUnavailableStatus(
  unavailable: boolean,
  entity: { name: string } | Organization | null,
  missingLabel: string,
  unavailableLabel: string,
): BadgeStatusItem[] {
  if (!unavailable) return []

  return [
    {
      kind: 'badge',
      label: entity ? unavailableLabel : missingLabel,
      tone: 'warning',
    },
  ]
}

export function resolveOrganizationMembershipPresentation(
  membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
): CharacterRelationshipRowPresentation {
  const organizationId = membership.organizationId
  const organization = resolveOrganizationMembershipOrganization(membership, context)
  const unavailable = !context.availableOrganizationIdSet.has(organizationId)
  const heading = resolveOrganizationMembershipLabel(organizationId, organization, context)
  const classification = organizationMembershipTitle(membership, organization) ?? undefined

  return {
    heading,
    classification,
    status: buildUnavailableStatus(
      unavailable,
      organization,
      'Missing organization',
      'Unavailable',
    ),
    toolbarAriaLabel: heading,
    headingHref:
      context.mode === 'api' && context.campaignId && organization
        ? ROUTES.content.organizations.detail(context.campaignId, organizationId)
        : undefined,
  }
}

function resolveResidenceLocation(
  edge: CharacterResidenceEdge,
  locationId: string,
  context: CharacterRelationshipFieldContext,
) {
  return (
    context.locationsById.get(locationId) ?? ('location' in edge ? edge.location : null) ?? null
  )
}

export function resolveResidencePresentation(
  edge: CharacterResidenceEdge,
  context: CharacterRelationshipFieldContext,
): CharacterRelationshipRowPresentation {
  const connection = 'connection' in edge ? edge.connection : edge
  const location = resolveResidenceLocation(edge, connection.locationId, context)
  const unavailable = !context.availableResidenceIdSet.has(connection.locationId)
  const heading = location?.name ?? UNAVAILABLE_LOCATION_LABEL
  const classification = location ? resolveLocationClassificationDisplay(location).text : undefined

  return {
    heading,
    classification,
    status: buildUnavailableStatus(unavailable, location, 'Missing location', 'Unavailable'),
    toolbarAriaLabel: heading,
    headingHref:
      context.mode === 'api' && context.campaignId && location
        ? ROUTES.content.locations.detail(context.campaignId, connection.locationId)
        : undefined,
  }
}

export function resolveOrganizationMembershipPresentationFromValues(
  values: Record<string, unknown>,
  context: CharacterRelationshipFieldContext,
): CharacterRelationshipRowPresentation | undefined {
  const organizationId = values.organizationId
  if (typeof organizationId !== 'string' || organizationId.length === 0) return undefined

  const membership: OrganizationMembershipFormRow = {
    relationshipId:
      typeof values.relationshipId === 'string' ? values.relationshipId : organizationId,
    organizationId,
    ...(typeof values.title === 'string' ? { title: values.title } : {}),
    ...(typeof values.priority === 'number' ? { priority: values.priority } : {}),
  }

  return resolveOrganizationMembershipPresentation(membership, context)
}

export function resolveResidencePresentationFromValues(
  values: Record<string, unknown>,
  context: CharacterRelationshipFieldContext,
): CharacterRelationshipRowPresentation | undefined {
  const locationId = values.locationId
  if (typeof locationId !== 'string' || locationId.length === 0) return undefined

  return resolveResidencePresentation(
    {
      relationshipId:
        typeof values.relationshipId === 'string' ? values.relationshipId : String(locationId),
      locationId,
      kind: 'resides_at',
    },
    context,
  )
}

export function canEditOrganizationMembershipTitle(
  _membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
  organization: Organization | null,
): boolean {
  return (
    context.mode === 'api' &&
    organization !== null &&
    typeof organization.organizationDomain === 'string' &&
    Boolean(context.onEditMembership)
  )
}

export function shouldOfferUnresolvedMembershipRemoval(
  _membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
  unavailable: boolean,
): boolean {
  return context.mode === 'api' && unavailable && Boolean(context.onRemoveUnresolvedMembership)
}

export type OrganizationMembershipEditTarget = OrganizationMembershipSheetRow
