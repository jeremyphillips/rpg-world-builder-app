import { randomUUID } from 'node:crypto'

import type {
  CharacterLocationConnection,
  LocationConnectionEligibilityInput,
} from '@rpg/contracts'
import {
  buildCharacterLocationConnection,
  characterLocationConnectionsSchema,
  isCharacterLocationConnectionEligible,
  type CreateCharacterLocationConnectionInput,
  type UpdateCharacterLocationConnectionInput,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { CharacterModel } from '../../character'

type CharacterConnectionsDocument = {
  connections?: {
    locations?: CharacterLocationConnection[]
  }
}

export function readCharacterLocationConnections(
  character: CharacterConnectionsDocument,
): CharacterLocationConnection[] {
  return [...(character.connections?.locations ?? [])]
}

export function assertCharacterLocationConnectionEligible(
  location: LocationConnectionEligibilityInput,
  kind: CharacterLocationConnection['kind'],
): void {
  if (!isCharacterLocationConnectionEligible(location, kind)) {
    throw new HttpError(
      400,
      'validation_error',
      `Connection kind "${kind}" is not valid for this location.`,
    )
  }
}

export function addCharacterLocationConnection(
  existing: readonly CharacterLocationConnection[],
  input: CreateCharacterLocationConnectionInput,
): CharacterLocationConnection[] {
  const relationship = buildCharacterLocationConnection({
    id: input.id ?? randomUUID(),
    locationId: input.locationId,
    kind: input.kind,
  })

  return characterLocationConnectionsSchema.parse([...existing, relationship])
}

export function updateCharacterLocationConnection(
  existing: readonly CharacterLocationConnection[],
  connectionId: string,
  patch: UpdateCharacterLocationConnectionInput,
): CharacterLocationConnection[] {
  const index = existing.findIndex((connection) => connection.id === connectionId)
  if (index === -1) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${connectionId}" was not found on this character.`,
    )
  }

  const current = existing[index]!
  const next = [...existing]
  next[index] = buildCharacterLocationConnection({
    id: connectionId,
    locationId: patch.locationId ?? current.locationId,
    kind: patch.kind ?? current.kind,
  })

  return characterLocationConnectionsSchema.parse(next)
}

export function removeCharacterLocationConnection(
  existing: readonly CharacterLocationConnection[],
  connectionId: string,
): CharacterLocationConnection[] {
  if (!existing.some((connection) => connection.id === connectionId)) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${connectionId}" was not found on this character.`,
    )
  }

  return characterLocationConnectionsSchema.parse(
    existing.filter((connection) => connection.id !== connectionId),
  )
}

export async function persistCharacterLocationConnections(
  characterId: string,
  connections: CharacterLocationConnection[],
): Promise<void> {
  const result = await CharacterModel.updateOne(
    { _id: characterId },
    { $set: { 'connections.locations': connections } },
  )

  if (result.matchedCount !== 1) {
    throw new HttpError(404, 'not_found', 'Character not found.')
  }
}

export type CharacterLocationConnectionMutationResult = {
  connection: CharacterLocationConnection
}

export async function createCharacterLocationConnectionRecord(input: {
  characterId: string
  character: CharacterConnectionsDocument
  location: LocationConnectionEligibilityInput
  body: CreateCharacterLocationConnectionInput
}): Promise<CharacterLocationConnectionMutationResult> {
  assertCharacterLocationConnectionEligible(input.location, input.body.kind)

  const existing = readCharacterLocationConnections(input.character)
  const connections = addCharacterLocationConnection(existing, input.body)
  const connection = connections.at(-1)
  if (!connection) {
    throw new HttpError(500, 'internal_error', 'Location connection mutation failed.')
  }

  await persistCharacterLocationConnections(input.characterId, connections)
  return { connection }
}

export async function updateCharacterLocationConnectionRecord(input: {
  characterId: string
  character: CharacterConnectionsDocument
  location: LocationConnectionEligibilityInput
  connectionId: string
  body: UpdateCharacterLocationConnectionInput
}): Promise<CharacterLocationConnectionMutationResult> {
  const existing = readCharacterLocationConnections(input.character)
  const current = existing.find((connection) => connection.id === input.connectionId)
  if (!current) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${input.connectionId}" was not found on this character.`,
    )
  }

  const nextLocationId = input.body.locationId ?? current.locationId
  const nextKind = input.body.kind ?? current.kind
  assertCharacterLocationConnectionEligible(input.location, nextKind)

  const connections = updateCharacterLocationConnection(existing, input.connectionId, input.body)
  const connection = connections.find((row) => row.id === input.connectionId)
  if (!connection) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${input.connectionId}" was not found on this character.`,
    )
  }

  if (connection.locationId !== nextLocationId) {
    throw new HttpError(
      400,
      'validation_error',
      'Location id changes require deleting and recreating the connection.',
    )
  }

  await persistCharacterLocationConnections(input.characterId, connections)
  return { connection }
}

export async function deleteCharacterLocationConnectionRecord(input: {
  characterId: string
  character: CharacterConnectionsDocument
  connectionId: string
}): Promise<void> {
  const existing = readCharacterLocationConnections(input.character)
  const connections = removeCharacterLocationConnection(existing, input.connectionId)
  await persistCharacterLocationConnections(input.characterId, connections)
}
