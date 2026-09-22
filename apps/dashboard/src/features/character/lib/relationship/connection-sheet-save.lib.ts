import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'

import { createCharacterRelationshipIdempotencyKey } from '../../api/character-relationship-client'
import {
  buildPersonRelationshipCreateInput,
  buildPlaceRelationshipCreateInput,
  buildPropertyRelationshipCreateInput,
} from './connection-create-input.lib'
import {
  resolvePersonRoleOptionFromProjection,
  resolvePlaceRoleOptionFromProjection,
  resolvePropertyRoleOptionFromProjection,
} from './connection-role-from-projection.lib'
import {
  PERSON_CONNECTION_ROLE_OPTIONS,
  PLACE_CONNECTION_ROLE_OPTIONS,
  PROPERTY_CONNECTION_ROLE_OPTIONS,
  type PersonConnectionRoleOption,
  type PlaceConnectionRoleOption,
  type PropertyConnectionRoleOption,
} from './connection-role-catalog'
import { getConnectionTopLevelSectionForKind } from './connection-section-catalog'

export type ConnectionSheetSaveInput = {
  personRoleId?: string
  placeRoleId?: string
  propertyRoleId?: string
  details?: Record<string, unknown>
}

function hasRoleChanged(
  nextRoleId: string | undefined,
  currentRoleId: string | undefined,
): boolean {
  return nextRoleId !== undefined && nextRoleId !== currentRoleId
}

// fallow-ignore-next-line complexity
// fallow-ignore-next-line complexity
export function resolveConnectionRoleChange(
  row: CharacterRelationshipProjectionRow,
  input: ConnectionSheetSaveInput,
): {
  sectionId: ReturnType<typeof getConnectionTopLevelSectionForKind>
  kindChanged: boolean
  nextPersonRole?: PersonConnectionRoleOption
  nextPlaceRole?: PlaceConnectionRoleOption
  nextPropertyRole?: PropertyConnectionRoleOption
} {
  const sectionId = getConnectionTopLevelSectionForKind(row.kind)
  const nextPersonRole = PERSON_CONNECTION_ROLE_OPTIONS.find(
    (role) => role.id === input.personRoleId,
  )
  const nextPlaceRole = PLACE_CONNECTION_ROLE_OPTIONS.find((role) => role.id === input.placeRoleId)
  const nextPropertyRole = PROPERTY_CONNECTION_ROLE_OPTIONS.find(
    (role) => role.id === input.propertyRoleId,
  )

  const kindChanged =
    (sectionId === 'people' &&
      hasRoleChanged(nextPersonRole?.id, resolvePersonRoleOptionFromProjection(row)?.id)) ||
    (sectionId === 'places' &&
      hasRoleChanged(nextPlaceRole?.id, resolvePlaceRoleOptionFromProjection(row)?.id)) ||
    (sectionId === 'property' &&
      hasRoleChanged(nextPropertyRole?.id, resolvePropertyRoleOptionFromProjection(row)?.id))

  return {
    sectionId,
    kindChanged,
    nextPersonRole,
    nextPlaceRole,
    nextPropertyRole,
  }
}

type ConnectionSheetMutations = {
  deleteRelationship: (
    relationshipId: string,
    input: { expectedRevision: number },
  ) => Promise<unknown>
  createRelationship: (command: {
    idempotencyKey: string
    relationship: ReturnType<typeof buildPersonRelationshipCreateInput>
  }) => Promise<unknown>
  updateRelationship: (
    relationshipId: string,
    input: { expectedRevision: number; details: Record<string, unknown> },
  ) => Promise<unknown>
}

export async function replaceConnectionRow(input: {
  row: CharacterRelationshipProjectionRow
  focalCharacterId: string
  sectionId: ReturnType<typeof getConnectionTopLevelSectionForKind>
  nextPersonRole?: PersonConnectionRoleOption
  nextPlaceRole?: PlaceConnectionRoleOption
  nextPropertyRole?: PropertyConnectionRoleOption
  details?: Record<string, unknown>
  mutations: ConnectionSheetMutations
}): Promise<void> {
  const targetId = input.row.target?.id
  if (!targetId) {
    throw new Error('Cannot replace a connection with an unresolved target.')
  }

  await input.mutations.deleteRelationship(input.row.relationshipId, {
    expectedRevision: input.row.revision,
  })

  if (input.sectionId === 'people' && input.nextPersonRole) {
    await input.mutations.createRelationship({
      idempotencyKey: createCharacterRelationshipIdempotencyKey(),
      relationship: buildPersonRelationshipCreateInput(
        input.focalCharacterId,
        targetId,
        input.nextPersonRole,
      ),
    })
    return
  }

  if (input.sectionId === 'places' && input.nextPlaceRole) {
    await input.mutations.createRelationship({
      idempotencyKey: createCharacterRelationshipIdempotencyKey(),
      relationship: buildPlaceRelationshipCreateInput(
        input.focalCharacterId,
        targetId,
        input.nextPlaceRole,
        input.details,
      ),
    })
    return
  }

  if (input.sectionId === 'property' && input.nextPropertyRole) {
    await input.mutations.createRelationship({
      idempotencyKey: createCharacterRelationshipIdempotencyKey(),
      relationship: buildPropertyRelationshipCreateInput(
        input.focalCharacterId,
        targetId,
        input.nextPropertyRole,
        input.details,
      ),
    })
  }
}

export async function updateConnectionRowDetails(input: {
  row: CharacterRelationshipProjectionRow
  details?: Record<string, unknown>
  mutations: ConnectionSheetMutations
}): Promise<void> {
  if (!input.details) return

  await input.mutations.updateRelationship(input.row.relationshipId, {
    expectedRevision: input.row.revision,
    details: input.details,
  })
}
