'use client'

import type {
  Location,
  LocationConnectedPartyOrganizationRow,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { DetailSectionPanel } from '../../../lib/detail/section/detail-section-panel.client'
import { RelationshipList } from '../../../lib/relationship/list/relationship-list.client'
import {
  isRelationshipMutationActionVisible,
  resolveRelationshipAlternatives,
  type RelationshipCandidateSet,
} from '../../../lib/relationship/location-connection/location-connection-alternatives'
import {
  buildRelationshipOverflowActions,
  type RelationshipOverflowActionId,
} from '../../../lib/relationship/list/relationship-overflow-actions'
import {
  relationshipGroupUsesLabeledSlotActions,
  resolveLocationConnectedPartyRelationshipPresentation,
} from '../../../lib/relationship/list/relationship-group-presentation'
import {
  TERRITORIAL_AUTHORITY_OVERFLOW,
  TERRITORIAL_AUTHORITY_SECTION_HEADING,
  TERRITORIAL_AUTHORITY_SECTION_HELPER,
  TERRITORIAL_AUTHORITY_SLOT_COPY,
} from '../../lib/connected-parties/location-connection-surface-copy'
import { LOCATION_CONNECTION_KIND_OPTIONS_COPY } from '../../lib/connected-parties/location-connection-kind-options-copy.lib'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'
import { TERRITORIAL_AUTHORITY_HEADING_ID } from '../../lib/connected-parties/location-connected-parties-section-layout'

export { TERRITORIAL_AUTHORITY_SECTION_EMPTY } from '../../lib/connected-parties/location-connection-surface-copy'

const TERRITORIAL_AUTHORITY_GROUP_PRESENTATION =
  resolveLocationConnectedPartyRelationshipPresentation('territorial_authority')

if (!relationshipGroupUsesLabeledSlotActions(TERRITORIAL_AUTHORITY_GROUP_PRESENTATION)) {
  throw new Error('Territorial authority section requires meaningful_slots group presentation')
}

const SINGLETON_KINDS = [
  'governs',
  'controls',
] as const satisfies readonly OrganizationLocationConnectionKind[]

export type LocationTerritorialMutationContext = {
  location: Location
  rows: readonly LocationConnectedPartyRow[]
  organizationCandidates: RelationshipCandidateSet<{ id: string; name: string }>
}

function buildTerritorialOverflowActions(input: {
  campaignId: string
  row: LocationConnectedPartyOrganizationRow
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
      kind: input.row.kind,
      subjectOrganizationId: input.row.subject.id,
      allowReplaceSubject: true,
    },
    location: input.mutationContext.location,
    rows: input.mutationContext.rows,
    organizationCandidates: input.mutationContext.organizationCandidates,
    copy: LOCATION_CONNECTION_KIND_OPTIONS_COPY,
  })

  const editTarget: LocationConnectedPartyEditTarget = {
    relationshipId: input.row.relationshipId,
    subjectType: 'organization',
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
        subjectType: input.row.subjectType,
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
  row: LocationConnectedPartyOrganizationRow
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
  const actions = buildTerritorialOverflowActions({
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
  })

  return (
    <RelationshipList.Row
      title={input.row.subject.name}
      href={ROUTES.content.organizations.detail(input.campaignId, input.row.subject.id)}
      menu={
        actions.length > 0
          ? {
              label: `Actions for ${input.row.subject.name}`,
              items: actions.map((action) => ({
                id: action.id,
                label: action.label,
                destructive: action.destructive,
                disabled: action.disabled,
                onSelect: action.onSelect,
              })),
            }
          : undefined
      }
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
  const organizationRows = rows.filter(
    (row): row is LocationConnectedPartyOrganizationRow => row.subjectType === 'organization',
  )
  const governsRow = organizationRows.find((row) => row.kind === 'governs')
  const controlsRow = organizationRows.find((row) => row.kind === 'controls')
  const claimRows = organizationRows.filter((row) => row.kind === 'claims')
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

  const totalRows = (governsRow ? 1 : 0) + (controlsRow ? 1 : 0) + claimRows.length
  const visibleGroupCount =
    SINGLETON_KINDS.filter((kind) => {
      const row = kind === 'governs' ? governsRow : controlsRow
      return row || canManage
    }).length + (showClaimsGroup ? 1 : 0)
  const rootItemCount = Math.max(totalRows, visibleGroupCount > 0 ? 1 : 0)

  return (
    <DetailSectionPanel
      heading={TERRITORIAL_AUTHORITY_SECTION_HEADING}
      headingId={TERRITORIAL_AUTHORITY_HEADING_ID}
      helper={showHelper ? TERRITORIAL_AUTHORITY_SECTION_HELPER : undefined}
    >
      <RelationshipList.Root itemCount={rootItemCount}>
        {SINGLETON_KINDS.map((kind) => {
          const row = kind === 'governs' ? governsRow : controlsRow
          const copy = TERRITORIAL_AUTHORITY_SLOT_COPY[kind]

          if (!row && !canManage) {
            return null
          }

          return (
            <RelationshipList.Group
              key={kind}
              label={copy.heading}
              itemCount={row ? 1 : 0}
              emptyLabel={copy.empty}
              headerAction={
                !row && canManage
                  ? { label: copy.add, onSelect: () => onAddKind?.(kind) }
                  : undefined
              }
            >
              {row
                ? renderTerritorialRelationshipRow({
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
                : null}
            </RelationshipList.Group>
          )
        })}

        {showClaimsGroup ? (
          <RelationshipList.Group
            label={TERRITORIAL_AUTHORITY_SLOT_COPY.claims.heading}
            itemCount={claimRows.length}
            emptyLabel={TERRITORIAL_AUTHORITY_SLOT_COPY.claims.empty}
            headerAction={
              canManage
                ? {
                    label: TERRITORIAL_AUTHORITY_SLOT_COPY.claims.add,
                    onSelect: () => onAddKind?.('claims'),
                  }
                : undefined
            }
          >
            {claimRows.map((row) =>
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
              }),
            )}
          </RelationshipList.Group>
        ) : null}
      </RelationshipList.Root>
    </DetailSectionPanel>
  )
}

export { TERRITORIAL_AUTHORITY_HEADING_ID }
