import { randomUUID } from 'node:crypto'

import type {
  Location,
  TerritorialAuthorityKind,
  TerritorialAuthorityRelationship,
} from '@rpg/contracts'
import {
  buildTerritorialAuthorityRelationship,
  territorialAuthorityRelationshipsSchema,
  type CreateTerritorialAuthorityRelationshipInput,
  type UpdateTerritorialAuthorityRelationshipInput,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { updateContentEntity } from '../lib/content-write.service'
import { locationWriteConfig } from './locations.config'

export function assertRegionLocation(
  location: Location,
): asserts location is Location & { kind: 'region' } {
  if (location.kind !== 'region') {
    throw new HttpError(400, 'validation_error', 'Territorial authority is only valid on regions.')
  }
}

export function readRegionTerritorialAuthority(
  location: Location,
): TerritorialAuthorityRelationship[] {
  assertRegionLocation(location)
  return [...(location.territorialAuthority ?? [])]
}

export function addTerritorialAuthorityRelationship(
  existing: readonly TerritorialAuthorityRelationship[],
  input: CreateTerritorialAuthorityRelationshipInput,
): TerritorialAuthorityRelationship[] {
  const relationship = buildTerritorialAuthorityRelationship({
    id: input.id ?? randomUUID(),
    organizationId: input.organizationId,
    kind: input.kind,
  })

  return territorialAuthorityRelationshipsSchema.parse([...existing, relationship])
}

export function updateTerritorialAuthorityRelationship(
  existing: readonly TerritorialAuthorityRelationship[],
  relationshipId: string,
  patch: UpdateTerritorialAuthorityRelationshipInput,
): TerritorialAuthorityRelationship[] {
  const index = existing.findIndex((relationship) => relationship.id === relationshipId)
  if (index === -1) {
    throw new HttpError(
      404,
      'not_found',
      `Territorial authority "${relationshipId}" was not found on this region.`,
    )
  }

  const current = existing[index]!
  const next = [...existing]
  next[index] = buildTerritorialAuthorityRelationship({
    id: relationshipId,
    organizationId: patch.organizationId ?? current.organizationId,
    kind: patch.kind ?? current.kind,
  })

  return territorialAuthorityRelationshipsSchema.parse(next)
}

export function removeTerritorialAuthorityRelationship(
  existing: readonly TerritorialAuthorityRelationship[],
  relationshipId: string,
): TerritorialAuthorityRelationship[] {
  if (!existing.some((relationship) => relationship.id === relationshipId)) {
    throw new HttpError(
      404,
      'not_found',
      `Territorial authority "${relationshipId}" was not found on this region.`,
    )
  }

  return territorialAuthorityRelationshipsSchema.parse(
    existing.filter((relationship) => relationship.id !== relationshipId),
  )
}

export async function persistRegionTerritorialAuthority(
  campaignId: string,
  locationId: string,
  relationships: TerritorialAuthorityRelationship[],
): Promise<Location> {
  return updateContentEntity(locationWriteConfig, campaignId, locationId, {
    kind: 'region',
    territorialAuthority: relationships,
  })
}

export async function mutateRegionTerritorialAuthority(input: {
  campaignId: string
  locationId: string
  location: Location
  relationships: TerritorialAuthorityRelationship[]
}): Promise<Location> {
  assertRegionLocation(input.location)
  return persistRegionTerritorialAuthority(input.campaignId, input.locationId, input.relationships)
}

export type TerritorialAuthorityMutationResult = {
  location: Location
  relationship: TerritorialAuthorityRelationship
}

export async function createRegionTerritorialAuthority(input: {
  campaignId: string
  locationId: string
  location: Location
  body: CreateTerritorialAuthorityRelationshipInput
}): Promise<TerritorialAuthorityMutationResult> {
  const existing = readRegionTerritorialAuthority(input.location)
  const relationships = addTerritorialAuthorityRelationship(existing, input.body)
  const relationship = relationships.at(-1)
  if (!relationship) {
    throw new HttpError(500, 'internal_error', 'Territorial authority mutation failed.')
  }

  const location = await mutateRegionTerritorialAuthority({
    campaignId: input.campaignId,
    locationId: input.locationId,
    location: input.location,
    relationships,
  })

  return { location, relationship }
}

export async function updateRegionTerritorialAuthority(input: {
  campaignId: string
  locationId: string
  location: Location
  relationshipId: string
  body: UpdateTerritorialAuthorityRelationshipInput
}): Promise<TerritorialAuthorityMutationResult> {
  const existing = readRegionTerritorialAuthority(input.location)
  const relationships = updateTerritorialAuthorityRelationship(
    existing,
    input.relationshipId,
    input.body,
  )
  const relationship = relationships.find((row) => row.id === input.relationshipId)
  if (!relationship) {
    throw new HttpError(
      404,
      'not_found',
      `Territorial authority "${input.relationshipId}" was not found on this region.`,
    )
  }

  const location = await mutateRegionTerritorialAuthority({
    campaignId: input.campaignId,
    locationId: input.locationId,
    location: input.location,
    relationships,
  })

  return { location, relationship }
}

export async function deleteRegionTerritorialAuthority(input: {
  campaignId: string
  locationId: string
  location: Location
  relationshipId: string
}): Promise<Location> {
  const existing = readRegionTerritorialAuthority(input.location)
  const relationships = removeTerritorialAuthorityRelationship(existing, input.relationshipId)

  return mutateRegionTerritorialAuthority({
    campaignId: input.campaignId,
    locationId: input.locationId,
    location: input.location,
    relationships,
  })
}

export type { TerritorialAuthorityKind }
