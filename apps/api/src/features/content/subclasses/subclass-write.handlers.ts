import type { Request, Response } from 'express'

import { HttpError } from '../../../lib/http-error'
import { assertSubclassRouteClassId, subclassWriteConfig } from './subclasses.config'
import {
  listSubclasses,
  resolveSubclassesForCampaign,
  upsertSubclassCampaignAvailability,
} from './list-subclasses'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import {
  deleteContentEntity,
  getContentDeletionAvailability,
} from '../lib/content-deletion.service'
import { SubclassCampaignAvailabilityModel } from './subclass-campaign-availability.model'

function routeParams(req: Request): { campaignId: string; classId: string } {
  return req.params as { campaignId: string; classId: string }
}

function subclassRouteParams(req: Request): {
  campaignId: string
  classId: string
  subclassId: string
} {
  return req.params as { campaignId: string; classId: string; subclassId: string }
}

async function assertResolvedSubclassBelongsToClass(
  campaignId: string,
  classId: string,
  subclassId: string,
): Promise<void> {
  const subclasses = await resolveSubclassesForCampaign(campaignId, classId)
  if (!subclasses.some((subclass) => subclass.id === subclassId)) {
    throw new HttpError(404, 'not_found', 'Subclass not found for this class.')
  }
}

export { listSubclasses }

export async function createSubclassItem(req: Request, res: Response): Promise<void> {
  const { campaignId, classId } = routeParams(req)
  const normalizedBody = assertSubclassRouteClassId(
    'create',
    classId,
    req.body as Record<string, unknown>,
  )
  const entity = await createHomebrewContent(subclassWriteConfig, campaignId, normalizedBody)
  res.status(201).json({ subclasses: entity })
}

export async function updateSubclassItem(req: Request, res: Response): Promise<void> {
  const { campaignId, classId, subclassId } = subclassRouteParams(req)
  await assertResolvedSubclassBelongsToClass(campaignId, classId, subclassId)

  const normalizedBody = assertSubclassRouteClassId(
    'update',
    classId,
    req.body as Record<string, unknown>,
  )
  const entity = await updateContentEntity(
    subclassWriteConfig,
    campaignId,
    subclassId,
    normalizedBody,
  )
  res.status(200).json({ subclasses: entity })
}

export async function updateSubclassAvailability(req: Request, res: Response): Promise<void> {
  const { campaignId, classId, subclassId } = subclassRouteParams(req)
  await assertResolvedSubclassBelongsToClass(campaignId, classId, subclassId)

  const availability = await upsertSubclassCampaignAvailability(campaignId, subclassId, req.body)
  res.status(200).json({ availability })
}

export async function getSubclassDeletionAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, classId, subclassId } = subclassRouteParams(req)
  await assertResolvedSubclassBelongsToClass(campaignId, classId, subclassId)

  const availability = await getContentDeletionAvailability(
    subclassWriteConfig,
    campaignId,
    subclassId,
  )
  res.status(200).json({ availability })
}

export async function deleteSubclassItem(req: Request, res: Response): Promise<void> {
  const { campaignId, classId, subclassId } = subclassRouteParams(req)
  await assertResolvedSubclassBelongsToClass(campaignId, classId, subclassId)

  const result = await deleteContentEntity(subclassWriteConfig, campaignId, subclassId)
  if (result.status === 'blocked') {
    res.status(409).json({ result })
    return
  }

  await SubclassCampaignAvailabilityModel.deleteOne({ campaignId, targetId: subclassId })
  res.status(200).json({ result })
}
