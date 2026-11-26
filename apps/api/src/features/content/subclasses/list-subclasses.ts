import type { Request, Response } from 'express'

import type { CatalogOverlayListFailure, ResolvedSubclass } from '@rpg/contracts'

import { resolveContentListForCampaign } from '../content.service'
import {
  scopeSubclassesListForClass,
  type SubclassListResolution,
} from './scope-subclasses-list-for-class'
import { applyCatalogListFilter } from '../lib/apply-catalog-list-filter'
import { filterOverlayFailuresForListViewer } from '../lib/filter-overlay-failures-for-list-viewer'
import { resolveCatalogListFilter } from '../lib/resolve-catalog-membership-filter'
import { buildContentListUsageEnvelope } from '../lib/content-usage/build-content-list-usage-envelope'
import { contentUsageContextFromRequest } from '../lib/content-usage/content-usage-request-context'
import { subclassContentConfig } from './subclasses.config'

/** Resolved subclasses for one class: system + patches + homebrew, with campaign access metadata. */
export async function resolveSubclassesListForCampaign(
  campaignId: string,
  classId: string,
): Promise<{ subclasses: ResolvedSubclass[]; overlayFailures: CatalogOverlayListFailure[] }> {
  const resolution = await resolveContentListForCampaign(subclassContentConfig, campaignId)
  return scopeSubclassesListForClass(campaignId, classId, resolution)
}

export type { SubclassListResolution }

/** Resolved subclasses for one class: system + patches + homebrew, with campaign access metadata. */
export async function resolveSubclassesForCampaign(
  campaignId: string,
  classId: string,
): Promise<ResolvedSubclass[]> {
  const { subclasses } = await resolveSubclassesListForCampaign(campaignId, classId)
  return subclasses
}

export async function listSubclasses(req: Request, res: Response): Promise<void> {
  const { campaignId, classId } = req.params as { campaignId: string; classId: string }
  const { subclasses, overlayFailures } = await resolveSubclassesListForCampaign(
    campaignId,
    classId,
  )
  const catalogFilter = resolveCatalogListFilter(req)
  const visible = applyCatalogListFilter(subclasses, catalogFilter)
  const visibleOverlayFailures = await filterOverlayFailuresForListViewer(
    campaignId,
    'subclasses',
    overlayFailures,
    catalogFilter,
  )
  const usageEnvelope = await buildContentListUsageEnvelope(
    contentUsageContextFromRequest(req, campaignId),
    'subclasses',
    visible,
  )
  res.status(200).json({
    subclasses: usageEnvelope.items,
    ...(visibleOverlayFailures.length > 0 ? { overlayFailures: visibleOverlayFailures } : {}),
    ...(usageEnvelope.usageSummaryLabels
      ? { usageSummaryLabels: usageEnvelope.usageSummaryLabels }
      : {}),
    ...(usageEnvelope.overviewUsageScope
      ? { overviewUsageScope: usageEnvelope.overviewUsageScope }
      : {}),
  })
}
