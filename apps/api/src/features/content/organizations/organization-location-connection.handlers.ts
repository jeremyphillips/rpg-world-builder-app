import type { Request, Response } from 'express'

import type { Location, OrganizationLocationConnection } from '@rpg/contracts'
import {
  createOrganizationLocationConnectionInputSchema,
  updateOrganizationLocationConnectionInputSchema,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { HomebrewLocationModel } from '../locations/homebrew-location.model'
import { toHomebrewLocation } from '../locations/locations.config'
import type { HomebrewDoc } from '../lib/content-write-config'
import { resolveCatalogForCampaign } from '../content.service'
import {
  createOrganizationLocationConnectionRecord,
  deleteOrganizationLocationConnectionRecord,
  updateOrganizationLocationConnectionRecord,
} from './organization-location-connection-mutation'
import { organizationWriteConfig } from './organizations.config'
import { HomebrewOrganizationModel } from './homebrew-organization.model'

type OrganizationLocationConnectionsDocument = {
  connections?: {
    locations?: OrganizationLocationConnection[]
  }
}

function toLocationEligibilityInput(location: Location) {
  if (location.kind === 'structure') {
    return { kind: location.kind, structureType: location.structureType }
  }
  return { kind: location.kind }
}

function routeParams(req: Request): { campaignId: string; organizationId: string } {
  return req.params as { campaignId: string; organizationId: string }
}

function connectionRouteParams(req: Request): {
  campaignId: string
  organizationId: string
  connectionId: string
} {
  return req.params as { campaignId: string; organizationId: string; connectionId: string }
}

async function loadOrganizationForLocationConnectionWrite(
  campaignId: string,
  organizationId: string,
): Promise<OrganizationLocationConnectionsDocument> {
  const organization = await HomebrewOrganizationModel.findOne({
    _id: organizationId,
    campaignId,
  })
    .select({ connections: 1 })
    .lean<OrganizationLocationConnectionsDocument | null>()

  if (!organization) {
    throw new HttpError(404, 'not_found', 'Organization not found in campaign.')
  }

  return organization
}

async function loadCampaignLocation(campaignId: string, locationId: string) {
  const doc = await HomebrewLocationModel.findOne({
    _id: locationId,
    campaignId,
  }).lean<HomebrewDoc>()

  if (!doc) {
    throw new HttpError(
      404,
      'not_found',
      `Location "${locationId}" was not found in this campaign.`,
    )
  }

  return toHomebrewLocation(doc)
}

async function assertOrganizationExists(campaignId: string, organizationId: string) {
  const catalog = await resolveCatalogForCampaign(organizationWriteConfig.readConfig, campaignId)
  const organization = catalog.find((record) => record.id === organizationId)
  if (!organization) {
    throw new HttpError(404, 'not_found', 'Organization not found in campaign.')
  }
}

export async function createOrganizationLocationConnectionItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, organizationId } = routeParams(req)
  await assertOrganizationExists(campaignId, organizationId)

  const body = createOrganizationLocationConnectionInputSchema.parse(req.body)
  const organization = await loadOrganizationForLocationConnectionWrite(campaignId, organizationId)
  const location = await loadCampaignLocation(campaignId, body.locationId)

  const result = await createOrganizationLocationConnectionRecord({
    organizationId,
    organization,
    location: toLocationEligibilityInput(location),
    body,
  })

  res.status(201).json({ locationConnection: result.connection })
}

export async function updateOrganizationLocationConnectionItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, organizationId } = connectionRouteParams(req)
  await assertOrganizationExists(campaignId, organizationId)

  const { connectionId } = connectionRouteParams(req)
  const body = updateOrganizationLocationConnectionInputSchema.parse(req.body)
  const organization = await loadOrganizationForLocationConnectionWrite(campaignId, organizationId)

  const existingConnection = organization.connections?.locations?.find(
    (connection) => connection.id === connectionId,
  )

  if (!existingConnection) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${connectionId}" was not found on this organization.`,
    )
  }

  const targetLocationId = body.locationId ?? existingConnection.locationId
  const location = await loadCampaignLocation(campaignId, targetLocationId)

  const result = await updateOrganizationLocationConnectionRecord({
    organizationId,
    organization,
    location: toLocationEligibilityInput(location),
    connectionId,
    body,
  })

  res.status(200).json({ locationConnection: result.connection })
}

export async function deleteOrganizationLocationConnectionItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, organizationId } = connectionRouteParams(req)
  await assertOrganizationExists(campaignId, organizationId)

  const { connectionId } = connectionRouteParams(req)
  const organization = await loadOrganizationForLocationConnectionWrite(campaignId, organizationId)

  await deleteOrganizationLocationConnectionRecord({
    organizationId,
    organization,
    connectionId,
  })

  res.status(200).json({ ok: true })
}
