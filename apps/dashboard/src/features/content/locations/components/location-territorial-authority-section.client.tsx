'use client'

import type { LocationConnectedPartyRow, OrganizationLocationConnectionKind } from '@rpg/contracts'
import { Button } from '@rpg/ui'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import {
  RelationshipFieldGroup,
  RelationshipFieldGroupRow,
} from '../../lib/relationship/relationship-field-group.client'
import { RelationshipEmptyInlineRow } from '../../lib/relationship/relationship-empty-inline-row.client'
import type { RelationshipOverflowAction } from '../../lib/relationship/relationship-overflow-menu.client'
import {
  TERRITORIAL_AUTHORITY_OVERFLOW,
  TERRITORIAL_AUTHORITY_SECTION_HEADING,
  TERRITORIAL_AUTHORITY_SECTION_HELPER,
  TERRITORIAL_AUTHORITY_SLOT_COPY,
} from '../lib/location-connection-surface-copy'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'

export { TERRITORIAL_AUTHORITY_SECTION_EMPTY } from '../lib/location-connection-surface-copy'

const SINGLETON_KINDS = [
  'governs',
  'controls',
] as const satisfies readonly OrganizationLocationConnectionKind[]

const TERRITORIAL_AUTHORITY_HEADING_ID = 'location-connected-parties-territorial_authority-heading'

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

type LocationTerritorialAuthoritySectionBodyProps = {
  campaignId: string
  rows: readonly LocationConnectedPartyRow[]
  canManage: boolean
  showHelper?: boolean
  onAddKind?: (kind: OrganizationLocationConnectionKind) => void
  onChangeKind?: (input: LocationConnectedPartyEditTarget) => void
  onReplaceOrganization?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
}

function renderTerritorialRelationshipRow(input: {
  campaignId: string
  row: LocationConnectedPartyRow
  canManage: boolean
  navigate: (path: string) => void
  onChangeKind?: (target: LocationConnectedPartyEditTarget) => void
  onReplaceOrganization?: (target: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
}) {
  return (
    <CrossContentRelationshipRow
      heading={input.row.subject.name}
      href={ROUTES.content.organizations.detail(input.campaignId, input.row.subject.id)}
      actions={buildTerritorialOverflowActions({
        campaignId: input.campaignId,
        row: input.row,
        navigate: input.navigate,
        canEdit: input.canManage && Boolean(input.onChangeKind || input.onReplaceOrganization),
        canRemove: input.canManage && Boolean(input.onRemoveConnection),
        onChangeKind: input.onChangeKind,
        onReplaceOrganization: input.onReplaceOrganization,
        onRemoveConnection: input.onRemoveConnection,
      })}
      overflowTriggerLabel={`Actions for ${input.row.subject.name}`}
    />
  )
}

export function LocationTerritorialAuthoritySectionBody({
  campaignId,
  rows,
  canManage,
  showHelper = false,
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
    <RelationshipFieldGroup
      heading={TERRITORIAL_AUTHORITY_SECTION_HEADING}
      headingId={TERRITORIAL_AUTHORITY_HEADING_ID}
      helper={showHelper ? TERRITORIAL_AUTHORITY_SECTION_HELPER : undefined}
    >
      {SINGLETON_KINDS.map((kind) => {
        const row = kind === 'governs' ? governsRow : controlsRow
        const copy = TERRITORIAL_AUTHORITY_SLOT_COPY[kind]

        if (!row && !canManage) {
          return null
        }

        return (
          <RelationshipFieldGroupRow key={kind} eyebrow={copy.heading}>
            {row ? (
              renderTerritorialRelationshipRow({
                campaignId,
                row,
                canManage,
                navigate,
                onChangeKind,
                onReplaceOrganization,
                onRemoveConnection,
              })
            ) : canManage ? (
              <RelationshipEmptyInlineRow
                emptyLabel={copy.empty}
                addLabel={copy.add}
                onAdd={() => onAddKind?.(kind)}
              />
            ) : null}
          </RelationshipFieldGroupRow>
        )
      })}

      {showClaimsGroup ? (
        <RelationshipFieldGroupRow eyebrow={TERRITORIAL_AUTHORITY_SLOT_COPY.claims.heading}>
          {claimRows.length > 0 ? (
            <div className="space-y-1">
              <ul className="space-y-1">
                {claimRows.map((row) => (
                  <li key={row.relationshipId}>
                    {renderTerritorialRelationshipRow({
                      campaignId,
                      row,
                      canManage,
                      navigate,
                      onChangeKind,
                      onReplaceOrganization,
                      onRemoveConnection,
                    })}
                  </li>
                ))}
              </ul>
              {canManage ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  density="compact"
                  onClick={() => onAddKind?.('claims')}
                >
                  {TERRITORIAL_AUTHORITY_SLOT_COPY.claims.add}
                </Button>
              ) : null}
            </div>
          ) : canManage ? (
            <RelationshipEmptyInlineRow
              emptyLabel={TERRITORIAL_AUTHORITY_SLOT_COPY.claims.empty}
              addLabel={TERRITORIAL_AUTHORITY_SLOT_COPY.claims.add}
              onAdd={() => onAddKind?.('claims')}
            />
          ) : null}
        </RelationshipFieldGroupRow>
      ) : null}
    </RelationshipFieldGroup>
  )
}

export { TERRITORIAL_AUTHORITY_HEADING_ID }
