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
  batchGetContentCampaignAccessAvailability,
  updateContentCampaignAccess,
  attachCampaignAccessForTargetType,
} from './lib/content-campaign-access.service'
import { getHomebrewContentSummary } from './lib/homebrew-summary.service'
import { filterCatalogForMembership } from './lib/filter-catalog-for-viewer'
import { resolveCatalogMembershipFilter } from './lib/resolve-catalog-membership-filter'
import { duplicateContentEntity } from './lib/duplication/duplicate-content.service'
import { duplicateContentRequestSchema } from './lib/duplication/duplicate-content.types'
import { assertDuplicateContentType } from './lib/duplication/duplicate-content-policy'
import { CONTENT_DUPLICATION_IDEMPOTENCY_HEADER } from '@rpg/contracts'
import { listCampaignAccessParticipants } from './lib/campaign-access-participants.service'
import { buildContentListUsageEnvelope } from './lib/content-usage/build-content-list-usage-envelope'
import { contentUsageContextFromRequest } from './lib/content-usage/content-usage-request-context'
import { getContentEntityUsage } from './lib/content-usage/get-content-entity-usage'
import type { ContentUsageSurfaceKey } from './lib/content-usage/define-content-usage'

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
  const idempotencyKey = req.get(CONTENT_DUPLICATION_IDEMPOTENCY_HEADER)?.trim() || undefined
  const { writeConfig, entity } = await duplicateContentEntity({
    campaignId,
    contentType,
    entityId,
    requestedName: name,
    idempotencyKey,
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

export async function getContentUsageHandler(req: Request, res: Response): Promise<void> {
  const { campaignId, contentType, entityId } = req.params as {
    campaignId: string
    contentType: string
    entityId: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }
  const writeConfig = getContentWriteConfig(contentType)!
  const usage = await getContentEntityUsage(
    writeConfig,
    contentUsageContextFromRequest(req, campaignId),
    entityId,
  )
  res.status(200).json({ usage })
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
  const visible = filterCatalogForMembership(
    withCampaignAccess,
    resolveCatalogMembershipFilter(req),
  )
  const usageEnvelope = await buildContentListUsageEnvelope(
    contentUsageContextFromRequest(req, campaignId),
    contentType as ContentUsageSurfaceKey,
    visible,
  )
  res.status(200).json({
    [writeConfig.responseKey]: usageEnvelope.items,
    ...(usageEnvelope.usageSummaryLabels
      ? { usageSummaryLabels: usageEnvelope.usageSummaryLabels }
      : {}),
    ...(usageEnvelope.overviewUsageScope
      ? { overviewUsageScope: usageEnvelope.overviewUsageScope }
      : {}),
  })
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

export async function batchGetContentCampaignAccessAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, contentType } = req.params as {
    campaignId: string
    contentType: string
  }
  if (!isContentWriteType(contentType)) {
    throw new HttpError(404, 'not_found', `Unknown content type "${contentType}".`)
  }

  const writeConfig = getContentWriteConfig(contentType)!
  const { targets } = req.body as { targets: Array<{ entityId: string }> }
  const entityIds = targets.map((target) => target.entityId)
  const batch = await batchGetContentCampaignAccessAvailability(writeConfig, campaignId, entityIds)
  res.status(200).json(batch)
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
