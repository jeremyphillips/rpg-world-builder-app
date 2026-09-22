import { Link } from 'react-router-dom'
import { SquarePen } from 'lucide-react'

import {
  getOrganizationDomainLabel,
  resolveLocationClassificationDisplay,
  type Organization,
  type OrganizationReferenceResolution,
} from '@rpg/contracts'
import { Button } from '@rpg/ui'
import type { EntitySummaryStatusItem } from '@/features/content'

import { ROUTES } from '@/app/routes'
import { CrossContentRelationshipRow } from '@/features/content'
import {
  UNAVAILABLE_LOCATION_LABEL,
  UNAVAILABLE_ORGANIZATION_LABEL,
} from '../display/character-display'
import { BuilderInventoryRemoveAction } from '../../components/builder/inventory/builder-inventory-remove-action'
import type {
  CharacterOrganizationMembershipEdge,
  CharacterRelationshipFieldContext,
  CharacterResidenceEdge,
} from './character-relationship-field-context.types'

type TextStatusItem = Extract<EntitySummaryStatusItem, { kind: 'text' }>
type BadgeStatusItem = Extract<EntitySummaryStatusItem, { kind: 'badge' }>

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

function buildOrganizationMembershipStatus(
  secondary: string | null,
  unavailable: boolean,
  organization: Organization | null,
): Array<TextStatusItem | BadgeStatusItem> {
  const status: Array<TextStatusItem | BadgeStatusItem> = []
  if (secondary) {
    status.push({ kind: 'text', label: secondary, variant: 'muted' })
  }
  if (unavailable) {
    status.push({
      kind: 'badge',
      label: organization ? 'Unavailable' : 'Missing organization',
      tone: 'warning',
    })
  }
  return status
}

function resolveOrganizationMembershipTrailing(
  membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
  label: string,
  unavailable: boolean,
  organization: Organization | null,
  onRemove?: () => void,
) {
  if (context.mode === 'draft' && onRemove) {
    return {
      kind: 'action' as const,
      content: <BuilderInventoryRemoveAction itemLabel={label} onRemove={onRemove} />,
    }
  }

  const canEditTitle =
    context.mode === 'api' &&
    organization !== null &&
    typeof organization.organizationDomain === 'string' &&
    context.onEditMembership

  if (canEditTitle) {
    return {
      kind: 'action' as const,
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

  if (context.mode === 'api' && unavailable && context.onRemoveUnresolvedMembership) {
    return {
      kind: 'action' as const,
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

function resolveLinkedHeading(
  label: string,
  context: CharacterRelationshipFieldContext,
  detailRoute: string | null,
) {
  if (context.mode === 'api' && detailRoute) {
    return (
      <Link to={detailRoute} className="underline-offset-4 hover:underline">
        {label}
      </Link>
    )
  }
  return label
}

export function projectOrganizationMembershipRow(
  membership: CharacterOrganizationMembershipEdge,
  context: CharacterRelationshipFieldContext,
  onRemove?: () => void,
) {
  const organizationId = membership.organizationId
  const organization = resolveOrganizationMembershipOrganization(membership, context)
  const unavailable = !context.availableOrganizationIdSet.has(organizationId)
  const label = resolveOrganizationMembershipLabel(organizationId, organization, context)
  const status = buildOrganizationMembershipStatus(
    organizationMembershipTitle(membership, organization),
    unavailable,
    organization,
  )
  const trailing = resolveOrganizationMembershipTrailing(
    membership,
    context,
    label,
    unavailable,
    organization,
    onRemove,
  )
  const heading = resolveLinkedHeading(
    label,
    context,
    context.campaignId && organization
      ? ROUTES.content.organizations.detail(context.campaignId, organizationId)
      : null,
  )

  return {
    key: organizationId,
    content: (
      <CrossContentRelationshipRow
        heading={heading}
        status={status.length > 0 ? status : undefined}
        trailing={trailing ?? null}
      />
    ),
  }
}

function buildResidenceStatus(
  classification: string | null,
  unavailable: boolean,
  location: { name: string } | null,
): Array<TextStatusItem | BadgeStatusItem> {
  const status: Array<TextStatusItem | BadgeStatusItem> = []
  if (classification) {
    status.push({ kind: 'text', label: classification, variant: 'muted' })
  }
  if (unavailable) {
    status.push({
      kind: 'badge',
      label: location ? 'Unavailable' : 'Missing location',
      tone: 'warning',
    })
  }
  return status
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

function buildResidenceRowContent(
  connection: { id: string; locationId: string },
  location: ReturnType<typeof resolveResidenceLocation>,
  context: CharacterRelationshipFieldContext,
  onRemove?: () => void,
) {
  const unavailable = !context.availableResidenceIdSet.has(connection.locationId)
  const label = location?.name ?? UNAVAILABLE_LOCATION_LABEL
  const status = buildResidenceStatus(
    location ? resolveLocationClassificationDisplay(location).text : null,
    unavailable,
    location,
  )
  const heading = resolveLinkedHeading(
    label,
    context,
    context.campaignId && location
      ? ROUTES.content.locations.detail(context.campaignId, connection.locationId)
      : null,
  )
  const trailing = onRemove
    ? {
        kind: 'action' as const,
        content: <BuilderInventoryRemoveAction itemLabel={label} onRemove={onRemove} />,
      }
    : undefined

  return (
    <CrossContentRelationshipRow
      heading={heading}
      status={status.length > 0 ? status : undefined}
      trailing={trailing ?? null}
    />
  )
}

export function projectResidenceRow(
  edge: CharacterResidenceEdge,
  context: CharacterRelationshipFieldContext,
  onRemove?: () => void,
) {
  const connection = 'connection' in edge ? edge.connection : edge
  const location = resolveResidenceLocation(edge, connection.locationId, context)

  return {
    key: connection.id,
    content: buildResidenceRowContent(connection, location, context, onRemove),
  }
}
