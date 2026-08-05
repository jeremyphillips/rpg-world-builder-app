import type { Request, Response } from 'express'

import {
  createTerritorialAuthorityRelationshipInputSchema,
  updateTerritorialAuthorityRelationshipInputSchema,
} from '@rpg/contracts'

import { resolveContentEntityForWrite } from '../lib/content-write.service'
import { locationWriteConfig } from './locations.config'
import {
  createRegionTerritorialAuthority,
  deleteRegionTerritorialAuthority,
  updateRegionTerritorialAuthority,
} from './territorial-authority-mutation'

function routeParams(req: Request): { campaignId: string; locationId: string } {
  return req.params as { campaignId: string; locationId: string }
}

function relationshipRouteParams(req: Request): {
  campaignId: string
  locationId: string
  relationshipId: string
} {
  return req.params as { campaignId: string; locationId: string; relationshipId: string }
}

export async function createTerritorialAuthorityItem(req: Request, res: Response): Promise<void> {
  const { campaignId, locationId } = routeParams(req)
  const body = createTerritorialAuthorityRelationshipInputSchema.parse(req.body)
  const { entity: location } = await resolveContentEntityForWrite(
    locationWriteConfig,
    campaignId,
    locationId,
  )

  const result = await createRegionTerritorialAuthority({
    campaignId,
    locationId,
    location,
    body,
  })

  res.status(201).json({
    locations: result.location,
    territorialAuthority: result.relationship,
  })
}

export async function updateTerritorialAuthorityItem(req: Request, res: Response): Promise<void> {
  const { campaignId, locationId, relationshipId } = relationshipRouteParams(req)
  const body = updateTerritorialAuthorityRelationshipInputSchema.parse(req.body)
  const { entity: location } = await resolveContentEntityForWrite(
    locationWriteConfig,
    campaignId,
    locationId,
  )

  const result = await updateRegionTerritorialAuthority({
    campaignId,
    locationId,
    location,
    relationshipId,
    body,
  })

  res.status(200).json({
    locations: result.location,
    territorialAuthority: result.relationship,
  })
}

export async function deleteTerritorialAuthorityItem(req: Request, res: Response): Promise<void> {
  const { campaignId, locationId, relationshipId } = relationshipRouteParams(req)
  const { entity: location } = await resolveContentEntityForWrite(
    locationWriteConfig,
    campaignId,
    locationId,
  )

  const updated = await deleteRegionTerritorialAuthority({
    campaignId,
    locationId,
    location,
    relationshipId,
  })

  res.status(200).json({ locations: updated })
}
