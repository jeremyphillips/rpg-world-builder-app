import { randomUUID } from 'node:crypto'

import type {
  LocationConnectionEligibilityInput,
  OrganizationLocationConnection,
} from '@rpg/contracts'
import {
  buildOrganizationLocationConnection,
  isOrganizationLocationConnectionEligible,
  organizationLocationConnectionsSchema,
  type CreateOrganizationLocationConnectionInput,
  type UpdateOrganizationLocationConnectionInput,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { HomebrewOrganizationModel } from './homebrew-organization.model'
import { assertOrganizationLocationConnectionLocationOccupancy } from './assert-organization-location-connection-location-occupancy'
import { loadOrganizationLocationConnectionEdgesAtLocation } from './load-organization-location-connection-edges-at-location'

type OrganizationConnectionsDocument = {
  connections?: {
    locations?: OrganizationLocationConnection[]
  }
}

export function readOrganizationLocationConnections(
  organization: OrganizationConnectionsDocument,
): OrganizationLocationConnection[] {
  return [...(organization.connections?.locations ?? [])]
}

export function assertOrganizationLocationConnectionEligible(
  location: LocationConnectionEligibilityInput,
  kind: OrganizationLocationConnection['kind'],
): void {
  if (!isOrganizationLocationConnectionEligible(location, kind)) {
    throw new HttpError(
      400,
      'validation_error',
      `Connection kind "${kind}" is not valid for this location.`,
    )
  }
}

export function addOrganizationLocationConnection(
  existing: readonly OrganizationLocationConnection[],
  input: CreateOrganizationLocationConnectionInput,
): OrganizationLocationConnection[] {
  const relationship = buildOrganizationLocationConnection({
    id: input.id ?? randomUUID(),
    locationId: input.locationId,
    kind: input.kind,
  })

  return organizationLocationConnectionsSchema.parse([...existing, relationship])
}

export function updateOrganizationLocationConnection(
  existing: readonly OrganizationLocationConnection[],
  connectionId: string,
  patch: UpdateOrganizationLocationConnectionInput,
): OrganizationLocationConnection[] {
  const index = existing.findIndex((connection) => connection.id === connectionId)
  if (index === -1) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${connectionId}" was not found on this organization.`,
    )
  }

  const current = existing[index]!
  const next = [...existing]
  next[index] = buildOrganizationLocationConnection({
    id: connectionId,
    locationId: patch.locationId ?? current.locationId,
    kind: patch.kind ?? current.kind,
  })

  return organizationLocationConnectionsSchema.parse(next)
}

export function removeOrganizationLocationConnection(
  existing: readonly OrganizationLocationConnection[],
  connectionId: string,
): OrganizationLocationConnection[] {
  if (!existing.some((connection) => connection.id === connectionId)) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${connectionId}" was not found on this organization.`,
    )
  }

  return organizationLocationConnectionsSchema.parse(
    existing.filter((connection) => connection.id !== connectionId),
  )
}

export async function persistOrganizationLocationConnections(
  organizationId: string,
  connections: OrganizationLocationConnection[],
): Promise<void> {
  const result = await HomebrewOrganizationModel.updateOne(
    { _id: organizationId },
    { $set: { 'connections.locations': connections } },
  )

  if (result.matchedCount !== 1) {
    throw new HttpError(404, 'not_found', 'Organization not found.')
  }
}

export type OrganizationLocationConnectionMutationResult = {
  connection: OrganizationLocationConnection
}

export async function createOrganizationLocationConnectionRecord(input: {
  organizationId: string
  organization: OrganizationConnectionsDocument
  campaignId: string
  location: LocationConnectionEligibilityInput
  body: CreateOrganizationLocationConnectionInput
}): Promise<OrganizationLocationConnectionMutationResult> {
  assertOrganizationLocationConnectionEligible(input.location, input.body.kind)

  const edgesAtLocation = await loadOrganizationLocationConnectionEdgesAtLocation(
    input.campaignId,
    input.body.locationId,
  )
  assertOrganizationLocationConnectionLocationOccupancy({
    locationId: input.body.locationId,
    kind: input.body.kind,
    subjectOrganizationId: input.organizationId,
    edgesAtLocation,
  })

  const existing = readOrganizationLocationConnections(input.organization)
  const connections = addOrganizationLocationConnection(existing, input.body)
  const connection = connections.at(-1)
  if (!connection) {
    throw new HttpError(500, 'internal_error', 'Location connection mutation failed.')
  }

  await persistOrganizationLocationConnections(input.organizationId, connections)
  return { connection }
}

export async function updateOrganizationLocationConnectionRecord(input: {
  organizationId: string
  organization: OrganizationConnectionsDocument
  campaignId: string
  location: LocationConnectionEligibilityInput
  connectionId: string
  body: UpdateOrganizationLocationConnectionInput
}): Promise<OrganizationLocationConnectionMutationResult> {
  const existing = readOrganizationLocationConnections(input.organization)
  const current = existing.find((connection) => connection.id === input.connectionId)
  if (!current) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${input.connectionId}" was not found on this organization.`,
    )
  }

  const nextLocationId = input.body.locationId ?? current.locationId
  const nextKind = input.body.kind ?? current.kind
  assertOrganizationLocationConnectionEligible(input.location, nextKind)

  const edgesAtLocation = await loadOrganizationLocationConnectionEdgesAtLocation(
    input.campaignId,
    nextLocationId,
  )
  assertOrganizationLocationConnectionLocationOccupancy({
    locationId: nextLocationId,
    kind: nextKind,
    subjectOrganizationId: input.organizationId,
    edgesAtLocation,
    excludeConnectionId: input.connectionId,
  })

  const connections = updateOrganizationLocationConnection(existing, input.connectionId, input.body)
  const connection = connections.find((row) => row.id === input.connectionId)
  if (!connection) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${input.connectionId}" was not found on this organization.`,
    )
  }

  await persistOrganizationLocationConnections(input.organizationId, connections)
  return { connection }
}

export async function deleteOrganizationLocationConnectionRecord(input: {
  organizationId: string
  organization: OrganizationConnectionsDocument
  connectionId: string
}): Promise<void> {
  const existing = readOrganizationLocationConnections(input.organization)
  const connections = removeOrganizationLocationConnection(existing, input.connectionId)
  await persistOrganizationLocationConnections(input.organizationId, connections)
}
