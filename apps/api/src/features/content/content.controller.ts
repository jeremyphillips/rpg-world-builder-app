import type { Request, Response } from 'express'

import { HttpError } from '../../lib/http-error'
import {
  getContentWriteConfig,
  isContentTypeName,
  isContentWriteType,
  resolveContentForCampaign,
} from './content-types'
import { createHomebrewContent, updateContentEntity } from './lib/content-write.service'
import { deleteContentEntity, getContentDeletionAvailability } from './lib/content-deletion.service'
import { getHomebrewContentSummary } from './lib/homebrew-summary.service'

export async function createContentItem(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType } = req.params as { campaignId: string; contentType: string }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const entity = await createHomebrewContent(writeConfig, campaignId, req.body)
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

/** Registry-driven catalog list — one handler for every registered content type. */
export async function listContent(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType } = req.params as { campaignId: string; contentType: string }
  if (!isContentTypeName(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const items = await resolveContentForCampaign(contentType, campaignId)
  res.status(200).json({ [writeConfig.responseKey]: items })
}

export { listSubclasses } from './subclasses/list-subclasses'

export async function getHomebrewSummary(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const summary = await getHomebrewContentSummary(campaignId)
  res.status(200).json({ summary })
}
