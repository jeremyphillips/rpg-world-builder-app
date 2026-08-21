'use client'

import type { Location, LocationConnectedPartyRow } from '@rpg/contracts'
import { useNavigate } from 'react-router-dom'

import {
  buildCharacterEntitySummaryVmFromTransport,
  formatCharacterMixedHeadingSuffix,
} from '@/features/character'

import { DetailSectionPanel } from '../../../lib/detail/section/detail-section-panel.client'
import { RelationshipList } from '../../../lib/relationship/list/relationship-list.client'
import {
  isRelationshipMutationActionVisible,
  resolveRelationshipAlternatives,
} from '../../../lib/relationship/location-connection/location-connection-alternatives'
import {
  buildRelationshipOverflowActions,
  type RelationshipOverflowActionId,
} from '../../../lib/relationship/list/relationship-overflow-actions'
import {
  relationshipGroupUsesRootFamilyAdd,
  resolveLocationConnectedPartyRelationshipPresentation,
} from '../../../lib/relationship/list/relationship-group-presentation'
import { LOCATION_CONNECTION_KIND_OPTIONS_COPY } from '../../lib/connected-parties/location-connection-kind-options-copy.lib'
import { LOCATION_PEOPLE_SECTION_SURFACE_COPY } from '../../lib/connected-parties/location-connected-parties-section-copy'
import { LOCATION_INVERSE_PEOPLE_OVERFLOW } from '../../lib/connected-parties/location-connection-surface-copy'
import type { PeopleKindSlot } from '../../lib/connected-parties/location-connected-parties-people-kind-slots'
import {
  peopleKindBindingKey,
  peopleKindSlotKey,
} from '../../lib/connected-parties/location-connected-parties-people-kind-slots'
import type { LocationConnectedPartyCharacterOption } from '../../lib/connected-parties/location-connected-party-character-options.lib'
import { resolveLocationConnectedPartySubjectHref } from '../../lib/connected-parties/resolve-location-connected-party-subject-href'
import {
  toLocationConnectedPartyEditTarget,
  type LocationConnectedPartyEditTarget,
} from './location-connected-parties-section.client'

const PEOPLE_AND_ORGANIZATIONS_GROUP_PRESENTATION =
  resolveLocationConnectedPartyRelationshipPresentation('people_and_organizations')

if (!relationshipGroupUsesRootFamilyAdd(PEOPLE_AND_ORGANIZATIONS_GROUP_PRESENTATION)) {
  throw new Error('People and organizations section requires sparse_groups group presentation')
}

export type LocationPeopleMutationContext = {
  location: Location
  rows: readonly LocationConnectedPartyRow[]
}

function buildPeopleOverflowActions(input: {
  campaignId: string
  row: LocationConnectedPartyRow
  canManage: boolean
  canEditRow: boolean
  canRemoveRow: boolean
  mutationContext: LocationPeopleMutationContext
  navigate: (path: string) => void
  onEditConnection?: (target: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
}) {
  const { row } = input
  const isOrganization = row.subjectType === 'organization'
  const detailHref = resolveLocationConnectedPartySubjectHref(input.campaignId, row.subject)

  const resolved =
    row.subjectType === 'organization'
      ? resolveRelationshipAlternatives({
          surface: 'location_inverse_organization',
          canManage: input.canManage,
          canEditRow: input.canEditRow,
          canRemoveRow: input.canRemoveRow,
          relationship: {
            relationshipId: row.relationshipId,
            locationId: input.mutationContext.location.id,
            kind: row.kind,
            subjectOrganizationId: row.subject.id,
            allowReplaceSubject: false,
          },
          location: input.mutationContext.location,
          rows: input.mutationContext.rows,
          copy: LOCATION_CONNECTION_KIND_OPTIONS_COPY,
        })
      : resolveRelationshipAlternatives({
          surface: 'location_inverse_character',
          canManage: input.canManage,
          canEditRow: input.canEditRow,
          canRemoveRow: input.canRemoveRow,
          relationship: {
            relationshipId: row.relationshipId,
            locationId: input.mutationContext.location.id,
            kind: row.kind,
            subjectCharacterId: row.subject.id,
          },
          location: input.mutationContext.location,
          rows: input.mutationContext.rows,
          copy: LOCATION_CONNECTION_KIND_OPTIONS_COPY,
        })

  const handlers: Partial<Record<RelationshipOverflowActionId, () => void>> = {
    view: () => input.navigate(detailHref),
  }

  if (
    isRelationshipMutationActionVisible(resolved.capabilities, 'changeKind') &&
    input.onEditConnection
  ) {
    handlers.changeKind = () => input.onEditConnection?.(toLocationConnectedPartyEditTarget(row))
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
      view: isOrganization
        ? LOCATION_INVERSE_PEOPLE_OVERFLOW.viewOrganization
        : LOCATION_INVERSE_PEOPLE_OVERFLOW.viewCharacter,
      changeKind: LOCATION_INVERSE_PEOPLE_OVERFLOW.changeKind,
      remove: LOCATION_INVERSE_PEOPLE_OVERFLOW.remove,
    },
    handlers,
  })
}

function rowsForSlot(
  slot: PeopleKindSlot,
  rowsByBinding: Map<string, LocationConnectedPartyRow[]>,
): LocationConnectedPartyRow[] {
  const slotRows: LocationConnectedPartyRow[] = []
  for (const binding of slot.bindings) {
    slotRows.push(...(rowsByBinding.get(peopleKindBindingKey(binding)) ?? []))
  }
  return slotRows
}

function resolveCharacterRowHeadingSuffix(
  row: LocationConnectedPartyRow,
  charactersById: ReadonlyMap<string, LocationConnectedPartyCharacterOption>,
  campaignId: string,
): string | undefined {
  if (row.subjectType !== 'character') {
    return undefined
  }

  const href = resolveLocationConnectedPartySubjectHref(campaignId, row.subject)
  const option = charactersById.get(row.subject.id)

  const summary = buildCharacterEntitySummaryVmFromTransport({
    id: row.subject.id,
    name: row.subject.name,
    summary: option?.summary ?? '',
    characterType: row.subject.characterType,
    href,
  })

  return formatCharacterMixedHeadingSuffix(summary)
}

export type LocationPeopleAndOrganizationsSectionBodyProps = {
  campaignId: string
  rows: readonly LocationConnectedPartyRow[]
  kindSlots: readonly PeopleKindSlot[]
  charactersById: ReadonlyMap<string, LocationConnectedPartyCharacterOption>
  canManage: boolean
  canAddToSection?: boolean
  heading: string
  headingId: string
  helper?: string
  sectionEmpty?: string
  mutationContext: LocationPeopleMutationContext
  onAddPeopleSection?: () => void
  onEditConnection?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => Promise<void>
  canEditRow?: (row: LocationConnectedPartyRow) => boolean
  canRemoveRow?: (row: LocationConnectedPartyRow) => boolean
}

// fallow-ignore-next-line complexity
export function LocationPeopleAndOrganizationsSectionBody({
  campaignId,
  rows,
  kindSlots,
  charactersById,
  canManage,
  canAddToSection = false,
  heading,
  headingId,
  helper,
  sectionEmpty,
  mutationContext,
  onAddPeopleSection,
  onEditConnection,
  onRemoveConnection,
  canEditRow,
  canRemoveRow,
}: LocationPeopleAndOrganizationsSectionBodyProps) {
  const navigate = useNavigate()

  const rowsByBinding = new Map<string, LocationConnectedPartyRow[]>()
  for (const row of rows) {
    const key = `${row.subjectType}:${row.kind}`
    const existing = rowsByBinding.get(key) ?? []
    existing.push(row)
    rowsByBinding.set(key, existing)
  }

  const populatedSlots = kindSlots.filter((slot) => rowsForSlot(slot, rowsByBinding).length > 0)
  const hasRows = rows.length > 0
  const showSection = hasRows || canManage

  if (!showSection) {
    return null
  }

  const familyAddEnabled = canManage && canAddToSection && Boolean(onAddPeopleSection)
  const addAction = familyAddEnabled
    ? { label: LOCATION_PEOPLE_SECTION_SURFACE_COPY.add, onSelect: onAddPeopleSection! }
    : undefined

  return (
    <DetailSectionPanel heading={heading} headingId={headingId} helper={helper}>
      <RelationshipList.Root itemCount={rows.length} emptyLabel={sectionEmpty} action={addAction}>
        {populatedSlots.map((slot) => {
          const slotRows = rowsForSlot(slot, rowsByBinding)

          return (
            <RelationshipList.Group
              key={peopleKindSlotKey(slot)}
              label={slot.heading}
              itemCount={slotRows.length}
            >
              {slotRows.map((row) => {
                const rowCanEdit = canManage && onEditConnection && (canEditRow?.(row) ?? true)
                const rowCanRemove =
                  canManage && onRemoveConnection && (canRemoveRow?.(row) ?? true)
                const headingSuffix = resolveCharacterRowHeadingSuffix(
                  row,
                  charactersById,
                  campaignId,
                )
                const actions = buildPeopleOverflowActions({
                  campaignId,
                  row,
                  navigate,
                  canManage,
                  canEditRow: Boolean(rowCanEdit),
                  canRemoveRow: Boolean(rowCanRemove),
                  mutationContext,
                  onEditConnection,
                  onRemoveConnection,
                })

                return (
                  <RelationshipList.Row
                    key={row.relationshipId}
                    title={row.subject.name}
                    href={resolveLocationConnectedPartySubjectHref(campaignId, row.subject)}
                    headingSuffix={headingSuffix}
                    menu={
                      actions.length > 0
                        ? {
                            label: `Actions for ${row.subject.name}`,
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
              })}
            </RelationshipList.Group>
          )
        })}
      </RelationshipList.Root>
    </DetailSectionPanel>
  )
}
