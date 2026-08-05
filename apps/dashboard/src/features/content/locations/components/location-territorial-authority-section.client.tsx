'use client'

import type { LocationConnectedPartyRow, OrganizationLocationConnectionKind } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import type { RelationshipOverflowAction } from '../../lib/relationship/relationship-overflow-menu.client'
import type { OrganizationConnectionDrawerIntent } from '../../lib/location-connection-drawer-intent'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'

export const TERRITORIAL_AUTHORITY_SECTION_EMPTY = 'No territorial authority recorded.'

export const TERRITORIAL_AUTHORITY_SLOT_COPY = {
  governs: {
    heading: 'Governs',
    empty: 'No governing organization.',
    add: 'Add governing organization',
  },
  controls: {
    heading: 'Controls',
    empty: 'No controlling organization.',
    add: 'Add controlling organization',
  },
  claims: {
    heading: 'Claims',
    empty: 'No organizations claim this location.',
    add: 'Add claim',
  },
} as const satisfies Record<
  Extract<OrganizationLocationConnectionKind, 'governs' | 'controls' | 'claims'>,
  { heading: string; empty: string; add: string }
>

const SINGLETON_KINDS = [
  'governs',
  'controls',
] as const satisfies readonly OrganizationLocationConnectionKind[]

function buildTerritorialOverflowActions(input: {
  campaignId: string
  row: LocationConnectedPartyRow
  canEdit: boolean
  canRemove: boolean
  navigate: (path: string) => void
  onEditConnection?: (target: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => Promise<void>
}): RelationshipOverflowAction[] {
  const actions: RelationshipOverflowAction[] = [
    {
      id: 'view',
      label: 'View organization',
      onSelect: () => {
        input.navigate(ROUTES.content.organizations.detail(input.campaignId, input.row.subject.id))
      },
    },
  ]

  if (input.canEdit && input.onEditConnection) {
    actions.push({
      id: 'change-kind',
      label: 'Change authority type',
      onSelect: () =>
        input.onEditConnection?.({
          relationshipId: input.row.relationshipId,
          subjectType: input.row.subject.type,
          subjectId: input.row.subject.id,
          kind: input.row.kind,
        }),
    })
  }

  if (input.canRemove && input.onRemoveConnection) {
    actions.push({
      id: 'remove',
      label: 'Remove authority',
      destructive: true,
      onSelect: () => {
        void input.onRemoveConnection?.({
          relationshipId: input.row.relationshipId,
          subjectType: input.row.subject.type,
          subjectId: input.row.subject.id,
        })
      },
    })
  }

  return actions
}

type TerritorialAuthoritySlotProps = {
  kind: (typeof SINGLETON_KINDS)[number]
  row?: LocationConnectedPartyRow
  canManage: boolean
  campaignId: string
  navigate: (path: string) => void
  onAdd?: (intent: OrganizationConnectionDrawerIntent) => void
  onEditConnection?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => Promise<void>
}

function TerritorialAuthoritySlot({
  kind,
  row,
  canManage,
  campaignId,
  navigate,
  onAdd,
  onEditConnection,
  onRemoveConnection,
}: TerritorialAuthoritySlotProps) {
  const copy = TERRITORIAL_AUTHORITY_SLOT_COPY[kind]

  if (!row && !canManage) {
    return null
  }

  return (
    <div className="space-y-2">
      <Heading variant="label" as="h3">
        {copy.heading}
      </Heading>
      {row ? (
        <CrossContentRelationshipRow
          heading={row.subject.name}
          subheading="Organization"
          href={ROUTES.content.organizations.detail(campaignId, row.subject.id)}
          actions={buildTerritorialOverflowActions({
            campaignId,
            row,
            navigate,
            canEdit: canManage && Boolean(onEditConnection),
            canRemove: canManage && Boolean(onRemoveConnection),
            onEditConnection,
            onRemoveConnection,
          })}
          overflowTriggerLabel={`Actions for ${row.subject.name}`}
        />
      ) : canManage ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-dashed border-border px-4 py-3">
          <Text variant="muted" className="text-sm">
            {copy.empty}
          </Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAdd?.('territorial_authority')}
          >
            {copy.add}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

type LocationTerritorialAuthoritySectionBodyProps = {
  campaignId: string
  rows: readonly LocationConnectedPartyRow[]
  canManage: boolean
  onAddOrganization?: (intent: OrganizationConnectionDrawerIntent) => void
  onEditConnection?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => Promise<void>
}

export function LocationTerritorialAuthoritySectionBody({
  campaignId,
  rows,
  canManage,
  onAddOrganization,
  onEditConnection,
  onRemoveConnection,
}: LocationTerritorialAuthoritySectionBodyProps) {
  const navigate = useNavigate()
  const governsRow = rows.find((row) => row.kind === 'governs')
  const controlsRow = rows.find((row) => row.kind === 'controls')
  const claimRows = rows.filter((row) => row.kind === 'claims')
  const showClaimsGroup = canManage || claimRows.length > 0
  const hasSingletonSlots = SINGLETON_KINDS.some((kind) => {
    const row = kind === 'governs' ? governsRow : controlsRow
    return row || canManage
  })

  if (!hasSingletonSlots && !showClaimsGroup) {
    return null
  }

  return (
    <div className="space-y-6">
      {SINGLETON_KINDS.map((kind) => {
        const row = kind === 'governs' ? governsRow : controlsRow
        return (
          <TerritorialAuthoritySlot
            key={kind}
            kind={kind}
            row={row}
            canManage={canManage}
            campaignId={campaignId}
            navigate={navigate}
            onAdd={onAddOrganization}
            onEditConnection={onEditConnection}
            onRemoveConnection={onRemoveConnection}
          />
        )
      })}

      {showClaimsGroup ? (
        <div className="space-y-2">
          <Heading variant="label" as="h3">
            {TERRITORIAL_AUTHORITY_SLOT_COPY.claims.heading}
          </Heading>
          {claimRows.length > 0 ? (
            <ul className="space-y-2">
              {claimRows.map((row) => (
                <li key={row.relationshipId}>
                  <CrossContentRelationshipRow
                    heading={row.subject.name}
                    subheading="Organization"
                    href={ROUTES.content.organizations.detail(campaignId, row.subject.id)}
                    actions={buildTerritorialOverflowActions({
                      campaignId,
                      row,
                      navigate,
                      canEdit: canManage && Boolean(onEditConnection),
                      canRemove: canManage && Boolean(onRemoveConnection),
                      onEditConnection,
                      onRemoveConnection,
                    })}
                    overflowTriggerLabel={`Actions for ${row.subject.name}`}
                  />
                </li>
              ))}
            </ul>
          ) : canManage ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border border-dashed border-border px-4 py-3">
              <Text variant="muted" className="text-sm">
                {TERRITORIAL_AUTHORITY_SLOT_COPY.claims.empty}
              </Text>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddOrganization?.('territorial_authority')}
              >
                {TERRITORIAL_AUTHORITY_SLOT_COPY.claims.add}
              </Button>
            </div>
          ) : null}
          {canManage && claimRows.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddOrganization?.('territorial_authority')}
            >
              {TERRITORIAL_AUTHORITY_SLOT_COPY.claims.add}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
