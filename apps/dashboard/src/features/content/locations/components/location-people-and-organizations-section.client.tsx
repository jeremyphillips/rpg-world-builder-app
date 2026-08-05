'use client'

import type {
  CharacterLocationConnectionKind,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { Button, Heading } from '@rpg/ui'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import { RelationshipEmptyInlineRow } from '../../lib/relationship/relationship-empty-inline-row.client'
import type { RelationshipOverflowAction } from '../../lib/relationship/relationship-overflow-menu.client'
import {
  LOCATION_INVERSE_CHARACTER_SURFACE_COPY,
  LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY,
  LOCATION_INVERSE_PEOPLE_OVERFLOW,
} from '../lib/location-connection-surface-copy'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'

type PeopleKindSlot =
  | {
      subjectType: 'organization'
      kind: OrganizationLocationConnectionKind
      heading: string
    }
  | {
      subjectType: 'character'
      kind: CharacterLocationConnectionKind
      heading: string
    }

function peopleKindSlotKey(slot: PeopleKindSlot): string {
  return `${slot.subjectType}:${slot.kind}`
}

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
  const detailHref = isOrganization
    ? ROUTES.content.organizations.detail(input.campaignId, input.row.subject.id)
    : ROUTES.campaign.characters.detail(input.campaignId, input.row.subject.id)

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

function resolvePeopleKindCopy(slot: PeopleKindSlot): { empty: string; add: string } {
  if (slot.subjectType === 'organization') {
    return LOCATION_INVERSE_ORGANIZATION_SURFACE_COPY[slot.kind]
  }
  return LOCATION_INVERSE_CHARACTER_SURFACE_COPY[slot.kind]
}

export type LocationPeopleAndOrganizationsSectionBodyProps = {
  campaignId: string
  rows: readonly LocationConnectedPartyRow[]
  kindSlots: readonly PeopleKindSlot[]
  canManage: boolean
  onAddOrganizationKind?: (kind: OrganizationLocationConnectionKind) => void
  onAddCharacterKind?: (kind: CharacterLocationConnectionKind) => void
  onEditConnection?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => void
  canEditRow?: (row: LocationConnectedPartyRow) => boolean
  canRemoveRow?: (row: LocationConnectedPartyRow) => boolean
}

export function LocationPeopleAndOrganizationsSectionBody({
  campaignId,
  rows,
  kindSlots,
  canManage,
  onAddOrganizationKind,
  onAddCharacterKind,
  onEditConnection,
  onRemoveConnection,
  canEditRow,
  canRemoveRow,
}: LocationPeopleAndOrganizationsSectionBodyProps) {
  const navigate = useNavigate()

  const rowsBySlot = new Map<string, LocationConnectedPartyRow[]>()
  for (const row of rows) {
    const key = `${row.subject.type}:${row.kind}`
    const existing = rowsBySlot.get(key) ?? []
    existing.push(row)
    rowsBySlot.set(key, existing)
  }

  const visibleSlots = kindSlots.filter((slot) => {
    const slotRows = rowsBySlot.get(peopleKindSlotKey(slot)) ?? []
    return slotRows.length > 0 || canManage
  })

  if (visibleSlots.length === 0) {
    return null
  }

  return (
    <div className="space-y-5">
      {visibleSlots.map((slot) => {
        const slotRows = rowsBySlot.get(peopleKindSlotKey(slot)) ?? []
        const copy = resolvePeopleKindCopy(slot)

        return (
          <div key={peopleKindSlotKey(slot)} className="space-y-1">
            <Heading variant="label" as="h3">
              {slot.heading}
            </Heading>
            {slotRows.length > 0 ? (
              <ul className="space-y-1">
                {slotRows.map((row) => {
                  const rowCanEdit = canManage && onEditConnection && (canEditRow?.(row) ?? true)
                  const rowCanRemove =
                    canManage && onRemoveConnection && (canRemoveRow?.(row) ?? true)

                  return (
                    <li key={row.relationshipId}>
                      <CrossContentRelationshipRow
                        heading={row.subject.name}
                        href={
                          row.subject.type === 'organization'
                            ? ROUTES.content.organizations.detail(campaignId, row.subject.id)
                            : ROUTES.campaign.characters.detail(campaignId, row.subject.id)
                        }
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
            ) : canManage ? (
              <RelationshipEmptyInlineRow
                emptyLabel={copy.empty}
                addLabel={copy.add}
                onAdd={() => {
                  if (slot.subjectType === 'organization') {
                    onAddOrganizationKind?.(slot.kind)
                  } else {
                    onAddCharacterKind?.(slot.kind)
                  }
                }}
              />
            ) : null}
            {canManage && slotRows.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (slot.subjectType === 'organization') {
                    onAddOrganizationKind?.(slot.kind)
                  } else {
                    onAddCharacterKind?.(slot.kind)
                  }
                }}
              >
                {copy.add}
              </Button>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export type { PeopleKindSlot }
