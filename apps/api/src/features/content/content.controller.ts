import type { Request, Response } from 'express'

import { contentStatusSchema } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import {
  getContentWriteConfig,
  isContentTypeName,
  isContentWriteType,
  resolveContentForCampaign,
} from './content-types'
import { createHomebrewContent, updateContentEntity } from './lib/content-write.service'
import { deleteContentEntity, getContentDeletionAvailability } from './lib/content-deletion.service'
import {
  demoteContentToDraft,
  getContentDemotionAvailability,
  promoteContentToPublished,
} from './lib/content-status.service'
import {
  getContentCampaignAccessAvailability,
  updateContentCampaignAccess,
  attachCampaignAccessForTargetType,
} from './lib/content-campaign-access.service'
import { getHomebrewContentSummary } from './lib/homebrew-summary.service'
import { filterCatalogForMembership } from './lib/filter-catalog-for-viewer'
import { duplicateContentEntity } from './lib/duplication/duplicate-content.service'
import { duplicateContentRequestSchema } from './lib/duplication/duplicate-content.types'
import { assertDuplicateContentType } from './lib/duplication/duplicate-content-policy'
import { listCampaignAccessParticipants } from './lib/campaign-access-participants.service'

export async function createContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType } = req.params as { campaignId: string; contentType: string }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const rawBody = req.body as Record<string, unknown>
  const { status: rawStatus, ...createBody } = rawBody
  const status = contentStatusSchema.parse(rawStatus ?? 'published')
  const entity = await createHomebrewContent(writeConfig, campaignId, createBody, { status })
  res.status(201).json({ [writeConfig.responseKey]: entity })
}

export async function duplicateContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  assertDuplicateContentType(contentType)
  const { name } = duplicateContentRequestSchema.parse(req.body)
  const { writeConfig, entity } = await duplicateContentEntity({
    campaignId,
    contentType,
    entityId,
    requestedName: name,
  })
  res.status(201).json({ [writeConfig.responseKey]: entity })
}

export async function updateContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const entity = await updateContentEntity(writeConfig, campaignId, entityId, req.body)
  res.status(200).json({ [writeConfig.responseKey]: entity })
}

export async function getContentDeletionAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const availability = await getContentDeletionAvailability(writeConfig, campaignId, entityId)
  res.status(200).json({ availability })
}

export async function deleteContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const result = await deleteContentEntity(writeConfig, campaignId, entityId)
  if (result.status === 'blocked') {
    res.status(409).json({ result })
    return
  }
  res.status(200).json({ result })
}

export async function publishContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const entity = await promoteContentToPublished(writeConfig, campaignId, entityId)
  res.status(200).json({ [writeConfig.responseKey]: entity })
}

export async function getContentDemotionAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const availability = await getContentDemotionAvailability(writeConfig, campaignId, entityId)
  res.status(200).json({ availability })
}

export async function demoteContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const result = await demoteContentToDraft(writeConfig, campaignId, entityId)
  if (result.status === 'blocked') {
    res.status(409).json({ result })
    return
  }
  res.status(200).json({ result })
}

/** Registry-driven catalog list — one handler for every registered content type. */
export async function listContent(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType } = req.params as { campaignId: string; contentType: string }
  if (!isContentTypeName(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const items = await resolveContentForCampaign(contentType, campaignId)
  const withCampaignAccess = await attachCampaignAccessForTargetType(campaignId, contentType, items)
  const visible = filterCatalogForMembership(withCampaignAccess, req.campaignMembership)
  res.status(200).json({ [writeConfig.responseKey]: visible })
}

export async function getContentCampaignAccessAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const availability = await getContentCampaignAccessAvailability(writeConfig, campaignId, entityId)
  res.status(200).json({ availability })
}

export async function updateContentCampaignAccessHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const result = await updateContentCampaignAccess(writeConfig, campaignId, entityId, req.body)
  if (result.status === 'blocked') {
    res.status(409).json({ result })
    return
  }
  res.status(200).json({ result })
}

export async function getHomebrewSummary(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const summary = await getHomebrewContentSummary(campaignId)
  res.status(200).json({ summary })
}

export async function getCampaignAccessParticipants(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const participants = await listCampaignAccessParticipants(campaignId)
  res.status(200).json({ participants })
}
