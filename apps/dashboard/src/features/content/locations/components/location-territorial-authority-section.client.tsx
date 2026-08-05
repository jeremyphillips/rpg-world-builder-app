'use client'

import type { LocationConnectedPartyRow, OrganizationLocationConnectionKind } from '@rpg/contracts'
import { Button, Heading } from '@rpg/ui'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import { RelationshipEmptyInlineRow } from '../../lib/relationship/relationship-empty-inline-row.client'
import type { RelationshipOverflowAction } from '../../lib/relationship/relationship-overflow-menu.client'
import {
  TERRITORIAL_AUTHORITY_OVERFLOW,
  TERRITORIAL_AUTHORITY_SLOT_COPY,
} from '../lib/location-connection-surface-copy'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'

export { TERRITORIAL_AUTHORITY_SECTION_EMPTY } from '../lib/location-connection-surface-copy'

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
  onChangeKind?: (target: LocationConnectedPartyEditTarget) => void
  onReplaceOrganization?: (target: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
}): RelationshipOverflowAction[] {
  const actions: RelationshipOverflowAction[] = [
    {
      id: 'view',
      label: TERRITORIAL_AUTHORITY_OVERFLOW.viewOrganization,
      onSelect: () => {
        input.navigate(ROUTES.content.organizations.detail(input.campaignId, input.row.subject.id))
      },
    },
  ]

  if (input.canEdit && input.onChangeKind) {
    actions.push({
      id: 'change-kind',
      label: TERRITORIAL_AUTHORITY_OVERFLOW.changeKind,
      onSelect: () =>
        input.onChangeKind?.({
          relationshipId: input.row.relationshipId,
          subjectType: input.row.subject.type,
          subjectId: input.row.subject.id,
          kind: input.row.kind,
        }),
    })
  }

  if (input.canEdit && input.onReplaceOrganization) {
    actions.push({
      id: 'replace',
      label: TERRITORIAL_AUTHORITY_OVERFLOW.replaceOrganization,
      onSelect: () =>
        input.onReplaceOrganization?.({
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
      label: TERRITORIAL_AUTHORITY_OVERFLOW.remove,
      destructive: true,
      onSelect: () => {
        input.onRemoveConnection?.({
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
  onAddKind?: (kind: OrganizationLocationConnectionKind) => void
  onChangeKind?: (input: LocationConnectedPartyEditTarget) => void
  onReplaceOrganization?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
}

function TerritorialAuthoritySlot({
  kind,
  row,
  canManage,
  campaignId,
  navigate,
  onAddKind,
  onChangeKind,
  onReplaceOrganization,
  onRemoveConnection,
}: TerritorialAuthoritySlotProps) {
  const copy = TERRITORIAL_AUTHORITY_SLOT_COPY[kind]

  if (!row && !canManage) {
    return null
  }

  return (
    <div className="space-y-1">
      <Heading variant="label" as="h3">
        {copy.heading}
      </Heading>
      {row ? (
        <CrossContentRelationshipRow
          heading={row.subject.name}
          href={ROUTES.content.organizations.detail(campaignId, row.subject.id)}
          actions={buildTerritorialOverflowActions({
            campaignId,
            row,
            navigate,
            canEdit: canManage && Boolean(onChangeKind || onReplaceOrganization),
            canRemove: canManage && Boolean(onRemoveConnection),
            onChangeKind,
            onReplaceOrganization,
            onRemoveConnection,
          })}
          overflowTriggerLabel={`Actions for ${row.subject.name}`}
        />
      ) : canManage ? (
        <RelationshipEmptyInlineRow
          emptyLabel={copy.empty}
          addLabel={copy.add}
          onAdd={() => onAddKind?.(kind)}
        />
      ) : null}
    </div>
  )
}

type LocationTerritorialAuthoritySectionBodyProps = {
  campaignId: string
  rows: readonly LocationConnectedPartyRow[]
  canManage: boolean
  onAddKind?: (kind: OrganizationLocationConnectionKind) => void
  onChangeKind?: (input: LocationConnectedPartyEditTarget) => void
  onReplaceOrganization?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
}

export function LocationTerritorialAuthoritySectionBody({
  campaignId,
  rows,
  canManage,
  onAddKind,
  onChangeKind,
  onReplaceOrganization,
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
    <div className="space-y-5">
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
            onAddKind={onAddKind}
            onChangeKind={onChangeKind}
            onReplaceOrganization={onReplaceOrganization}
            onRemoveConnection={onRemoveConnection}
          />
        )
      })}

      {showClaimsGroup ? (
        <div className="space-y-1">
          <Heading variant="label" as="h3">
            {TERRITORIAL_AUTHORITY_SLOT_COPY.claims.heading}
          </Heading>
          {claimRows.length > 0 ? (
            <ul className="space-y-1">
              {claimRows.map((row) => (
                <li key={row.relationshipId}>
                  <CrossContentRelationshipRow
                    heading={row.subject.name}
                    href={ROUTES.content.organizations.detail(campaignId, row.subject.id)}
                    actions={buildTerritorialOverflowActions({
                      campaignId,
                      row,
                      navigate,
                      canEdit: canManage && Boolean(onChangeKind || onReplaceOrganization),
                      canRemove: canManage && Boolean(onRemoveConnection),
                      onChangeKind,
                      onReplaceOrganization,
                      onRemoveConnection,
                    })}
                    overflowTriggerLabel={`Actions for ${row.subject.name}`}
                  />
                </li>
              ))}
            </ul>
          ) : canManage ? (
            <RelationshipEmptyInlineRow
              emptyLabel={TERRITORIAL_AUTHORITY_SLOT_COPY.claims.empty}
              addLabel={TERRITORIAL_AUTHORITY_SLOT_COPY.claims.add}
              onAdd={() => onAddKind?.('claims')}
            />
          ) : null}
          {canManage && claimRows.length > 0 ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onAddKind?.('claims')}>
              {TERRITORIAL_AUTHORITY_SLOT_COPY.claims.add}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
