'use client'

import type {
  Location,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { Button } from '@rpg/ui'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import {
  RelationshipFieldGroup,
  RelationshipFieldGroupRow,
} from '../../lib/relationship/relationship-field-group.client'
import { RelationshipEmptyInlineRow } from '../../lib/relationship/relationship-empty-inline-row.client'
import {
  isRelationshipMutationActionVisible,
  resolveRelationshipAlternatives,
  type RelationshipCandidateSet,
} from '../../lib/relationship/relationship-alternatives'
import {
  buildRelationshipOverflowActions,
  type RelationshipOverflowActionId,
} from '../../lib/relationship/resolve-relationship-overflow-actions'
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

export type LocationTerritorialMutationContext = {
  location: Location
  rows: readonly LocationConnectedPartyRow[]
  organizationCandidates: RelationshipCandidateSet<{ id: string; name: string }>
}

function buildTerritorialOverflowActions(input: {
  campaignId: string
  row: LocationConnectedPartyRow
  canManage: boolean
  canEditRow: boolean
  canRemoveRow: boolean
  mutationContext: LocationTerritorialMutationContext
  navigate: (path: string) => void
  onChangeKind?: (target: LocationConnectedPartyEditTarget) => void
  onReplaceOrganization?: (target: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
}) {
  const resolved = resolveRelationshipAlternatives({
    surface: 'location_inverse_organization',
    canManage: input.canManage,
    canEditRow: input.canEditRow,
    canRemoveRow: input.canRemoveRow,
    relationship: {
      relationshipId: input.row.relationshipId,
      locationId: input.mutationContext.location.id,
      kind: input.row.kind as OrganizationLocationConnectionKind,
      subjectOrganizationId: input.row.subject.id,
      allowReplaceSubject: true,
    },
    location: input.mutationContext.location,
    rows: input.mutationContext.rows,
    organizationCandidates: input.mutationContext.organizationCandidates,
  })

  const editTarget: LocationConnectedPartyEditTarget = {
    relationshipId: input.row.relationshipId,
    subjectType: input.row.subject.type,
    subjectId: input.row.subject.id,
    kind: input.row.kind,
  }

  const handlers: Partial<Record<RelationshipOverflowActionId, () => void>> = {
    view: () => {
      input.navigate(ROUTES.content.organizations.detail(input.campaignId, input.row.subject.id))
    },
  }

  if (
    isRelationshipMutationActionVisible(resolved.capabilities, 'changeKind') &&
    input.onChangeKind
  ) {
    handlers.changeKind = () => input.onChangeKind?.(editTarget)
  }

  if (
    isRelationshipMutationActionVisible(resolved.capabilities, 'replaceSubject') &&
    input.onReplaceOrganization
  ) {
    handlers.replaceSubject = () => input.onReplaceOrganization?.(editTarget)
  }

  if (resolved.capabilities.remove?.supported && input.onRemoveConnection) {
    handlers.remove = () => {
      input.onRemoveConnection?.({
        relationshipId: input.row.relationshipId,
        subjectType: input.row.subject.type,
        subjectId: input.row.subject.id,
      })
    }
  }

  return buildRelationshipOverflowActions({
    capabilities: resolved.capabilities,
    labels: {
      view: TERRITORIAL_AUTHORITY_OVERFLOW.viewOrganization,
      changeKind: TERRITORIAL_AUTHORITY_OVERFLOW.changeKind,
      replaceSubject: TERRITORIAL_AUTHORITY_OVERFLOW.replaceOrganization,
      remove: TERRITORIAL_AUTHORITY_OVERFLOW.remove,
    },
    handlers,
  })
}

type LocationTerritorialAuthoritySectionBodyProps = {
  campaignId: string
  rows: readonly LocationConnectedPartyRow[]
  canManage: boolean
  showHelper?: boolean
  mutationContext: LocationTerritorialMutationContext
  onAddKind?: (kind: OrganizationLocationConnectionKind) => void
  onChangeKind?: (input: LocationConnectedPartyEditTarget) => void
  onReplaceOrganization?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
  canEditRow?: (row: LocationConnectedPartyRow) => boolean
  canRemoveRow?: (row: LocationConnectedPartyRow) => boolean
}

function renderTerritorialRelationshipRow(input: {
  campaignId: string
  row: LocationConnectedPartyRow
  canManage: boolean
  canEditRow: boolean
  canRemoveRow: boolean
  mutationContext: LocationTerritorialMutationContext
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
        canManage: input.canManage,
        canEditRow: input.canEditRow,
        canRemoveRow: input.canRemoveRow,
        mutationContext: input.mutationContext,
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
  mutationContext,
  onAddKind,
  onChangeKind,
  onReplaceOrganization,
  onRemoveConnection,
  canEditRow,
  canRemoveRow,
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

  const resolveRowPermissions = (row: LocationConnectedPartyRow) => ({
    canEditRow: Boolean(canManage && (canEditRow?.(row) ?? true)),
    canRemoveRow: Boolean(canManage && (canRemoveRow?.(row) ?? true)),
  })

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
                mutationContext,
                onChangeKind,
                onReplaceOrganization,
                onRemoveConnection,
                ...resolveRowPermissions(row),
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
                      mutationContext,
                      onChangeKind,
                      onReplaceOrganization,
                      onRemoveConnection,
                      ...resolveRowPermissions(row),
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
