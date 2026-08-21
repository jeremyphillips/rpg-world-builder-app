'use client'

import { Link } from 'react-router-dom'
import { SquarePen, Trash2 } from 'lucide-react'
import type { OrganizationReferenceResolution } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { UNAVAILABLE_ORGANIZATION_LABEL } from '../../../lib/display/character-display'

export type CharacterOrganizationsSummaryMembership = OrganizationReferenceResolution

type CharacterOrganizationsSummaryRowProps = {
  campaignId: string
  membership: CharacterOrganizationsSummaryMembership
  canEdit: boolean
  onEditMembership?: (membership: CharacterOrganizationsSummaryMembership) => void
  onRemoveUnresolvedMembership?: (membership: CharacterOrganizationsSummaryMembership) => void
}

function canEditMembershipTitle(membership: CharacterOrganizationsSummaryMembership): boolean {
  return (
    membership.organization !== null &&
    typeof membership.organization.organizationDomain === 'string'
  )
}

function CharacterOrganizationsSummaryRow({
  campaignId,
  membership,
  canEdit,
  onEditMembership,
  onRemoveUnresolvedMembership,
}: CharacterOrganizationsSummaryRowProps) {
  const { organizationId, organization, title } = membership
  const label = organization?.name ?? UNAVAILABLE_ORGANIZATION_LABEL
  const editableTitle = canEditMembershipTitle(membership)

  return (
    <li className="flex flex-wrap items-center gap-1">
      <Text as="span" variant="muted" className="text-sm">
        {organization ? (
          <Link
            to={ROUTES.content.organizations.detail(campaignId, organizationId)}
            className="underline-offset-4 hover:underline"
          >
            {label}
          </Link>
        ) : (
          label
        )}
        {title ? ` · ${title}` : null}
      </Text>
      {canEdit && editableTitle && onEditMembership ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Edit membership in ${label}`}
          onClick={() => onEditMembership(membership)}
        >
          <SquarePen aria-hidden className="size-4" />
        </Button>
      ) : null}
      {canEdit && !editableTitle && onRemoveUnresolvedMembership ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove membership in ${label}`}
          onClick={() => onRemoveUnresolvedMembership(membership)}
        >
          <Trash2 aria-hidden className="size-4" />
        </Button>
      ) : null}
    </li>
  )
}

export type CharacterOrganizationsSummaryProps = {
  campaignId: string
  memberships: readonly CharacterOrganizationsSummaryMembership[]
  canEdit?: boolean
  onEditMembership?: (membership: CharacterOrganizationsSummaryMembership) => void
  onRemoveUnresolvedMembership?: (membership: CharacterOrganizationsSummaryMembership) => void
  onAddOrganization?: () => void
}

/** Compact organization membership rows for campaign character / NPC detail headers. */
export function CharacterOrganizationsSummary({
  campaignId,
  memberships,
  canEdit = false,
  onEditMembership,
  onRemoveUnresolvedMembership,
  onAddOrganization,
}: CharacterOrganizationsSummaryProps) {
  return (
    <div className="flex flex-col gap-1 pt-1">
      <Text as="span" variant="muted" className="text-sm">
        Organizations
      </Text>
      {memberships.length === 0 ? (
        <Text as="span" variant="muted" className="text-sm">
          None
        </Text>
      ) : (
        <ul className="flex flex-col gap-1">
          {memberships.map((membership) => (
            <CharacterOrganizationsSummaryRow
              key={membership.organizationId}
              campaignId={campaignId}
              membership={membership}
              canEdit={canEdit}
              onEditMembership={onEditMembership}
              onRemoveUnresolvedMembership={onRemoveUnresolvedMembership}
            />
          ))}
        </ul>
      )}
      {canEdit && onAddOrganization ? (
        <Button
          type="button"
          variant="text"
          size="sm"
          className="h-auto px-0"
          onClick={onAddOrganization}
        >
          + Add organization
        </Button>
      ) : null}
    </div>
  )
}
