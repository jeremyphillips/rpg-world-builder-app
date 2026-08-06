'use client'

import type { LocationConnectedPartyRow } from '@rpg/contracts'
import { Button } from '@rpg/ui'
import { useNavigate } from 'react-router-dom'

import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import {
  RelationshipFieldGroup,
  RelationshipFieldGroupRow,
} from '../../lib/relationship/relationship-field-group.client'
import { RelationshipEmptyInlineRow } from '../../lib/relationship/relationship-empty-inline-row.client'
import type { RelationshipOverflowAction } from '../../lib/relationship/relationship-overflow-menu.client'
import { LOCATION_PEOPLE_SECTION_SURFACE_COPY } from '../lib/location-connected-parties-section-copy'
import { LOCATION_INVERSE_PEOPLE_OVERFLOW } from '../lib/location-connection-surface-copy'
import type { PeopleKindSlot } from '../lib/location-connected-parties-people-kind-slots'
import {
  peopleKindBindingKey,
  peopleKindSlotKey,
} from '../lib/location-connected-parties-people-kind-slots'
import { resolveLocationConnectedPartySubjectHref } from '../lib/resolve-location-connected-party-subject-href'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'

function buildPeopleOverflowActions(input: {
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
  }) => void
}): RelationshipOverflowAction[] {
  const isOrganization = input.row.subject.type === 'organization'
  const detailHref = resolveLocationConnectedPartySubjectHref(input.campaignId, input.row.subject)

  const actions: RelationshipOverflowAction[] = [
    {
      id: 'view',
      label: isOrganization
        ? LOCATION_INVERSE_PEOPLE_OVERFLOW.viewOrganization
        : LOCATION_INVERSE_PEOPLE_OVERFLOW.viewCharacter,
      onSelect: () => input.navigate(detailHref),
    },
  ]

  if (input.canEdit && input.onEditConnection) {
    actions.push({
      id: 'change-kind',
      label: LOCATION_INVERSE_PEOPLE_OVERFLOW.changeKind,
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
      label: LOCATION_INVERSE_PEOPLE_OVERFLOW.remove,
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

export type LocationPeopleAndOrganizationsSectionBodyProps = {
  campaignId: string
  rows: readonly LocationConnectedPartyRow[]
  kindSlots: readonly PeopleKindSlot[]
  canManage: boolean
  canAddToSection?: boolean
  heading: string
  headingId: string
  helper?: string
  sectionEmpty?: string
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
  canManage,
  canAddToSection = false,
  heading,
  headingId,
  helper,
  sectionEmpty,
  onAddPeopleSection,
  onEditConnection,
  onRemoveConnection,
  canEditRow,
  canRemoveRow,
}: LocationPeopleAndOrganizationsSectionBodyProps) {
  const navigate = useNavigate()

  const rowsByBinding = new Map<string, LocationConnectedPartyRow[]>()
  for (const row of rows) {
    const key = `${row.subject.type}:${row.kind}`
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

  return (
    <RelationshipFieldGroup heading={heading} headingId={headingId} helper={helper}>
      {hasRows ? (
        <>
          {populatedSlots.map((slot) => {
            const slotRows = rowsForSlot(slot, rowsByBinding)

            return (
              <RelationshipFieldGroupRow key={peopleKindSlotKey(slot)} eyebrow={slot.heading}>
                <ul className="space-y-1">
                  {slotRows.map((row) => {
                    const rowCanEdit = canManage && onEditConnection && (canEditRow?.(row) ?? true)
                    const rowCanRemove =
                      canManage && onRemoveConnection && (canRemoveRow?.(row) ?? true)

                    return (
                      <li key={row.relationshipId}>
                        <CrossContentRelationshipRow
                          heading={row.subject.name}
                          href={resolveLocationConnectedPartySubjectHref(campaignId, row.subject)}
                          actions={buildPeopleOverflowActions({
                            campaignId,
                            row,
                            navigate,
                            canEdit: Boolean(rowCanEdit),
                            canRemove: Boolean(rowCanRemove),
                            onEditConnection,
                            onRemoveConnection,
                          })}
                          overflowTriggerLabel={`Actions for ${row.subject.name}`}
                        />
                      </li>
                    )
                  })}
                </ul>
              </RelationshipFieldGroupRow>
            )
          })}
          {familyAddEnabled ? (
            <div className="px-4 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                density="compact"
                onClick={onAddPeopleSection}
              >
                + {LOCATION_PEOPLE_SECTION_SURFACE_COPY.add}
              </Button>
            </div>
          ) : null}
        </>
      ) : canManage ? (
        <div className="px-4 py-2">
          <RelationshipEmptyInlineRow
            emptyLabel={sectionEmpty}
            addLabel={familyAddEnabled ? LOCATION_PEOPLE_SECTION_SURFACE_COPY.add : undefined}
            onAdd={familyAddEnabled ? onAddPeopleSection : undefined}
          />
        </div>
      ) : null}
    </RelationshipFieldGroup>
  )
}
