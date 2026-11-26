import { contentTypeKeySchema, type CatalogOverlayListFailure } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign'
import type { ContentTypeConfig } from './lib/content-type-config'
import { loadSystemContent, loadSystemContentPatches } from './lib/content-type-config'
import { enrichResolvedSystemRecords } from './lib/enrich-system-content-read'
import { resolveCatalog } from './lib/resolve-catalog'

type CampaignCatalogResolution<T extends { id: string }> = {
  items: T[]
  overlayFailures: CatalogOverlayListFailure[]
}

async function resolveCampaignCatalogKernel<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<CampaignCatalogResolution<T>> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const systemSeed = loadSystemContent(config, rulesetId)
  const [patches, homebrew] = await Promise.all([
    loadSystemContentPatches(config, campaignId),
    config.loadHomebrew(campaignId, rulesetId),
  ])

  const contentTypeKey = contentTypeKeySchema.safeParse(config.type).data
  const { records, overlayFailures } = resolveCatalog(systemSeed, patches, homebrew, {
    ...(contentTypeKey ? { contentTypeKey } : {}),
    overlayParticipantId: config.overlayParticipantId,
  })
  const seedById = new Map(
    systemSeed.map((record) => [record.id, record as unknown as Record<string, unknown>]),
  )
  const items = enrichResolvedSystemRecords(records, seedById, patches, config.overlayParticipantId)
  return { items, overlayFailures }
}

/**
 * Resolved entities only. Search, usage summaries, and other consumers that must
 * not treat an unresolved overlay as content. Management list handlers and
 * reference checks that distinguish "missing" from "overlay failed" use
 * {@link resolveContentListForCampaign} or {@link resolveCatalogForCampaignWithOverlayContext}.
 */
export async function resolveCatalogForCampaign<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<T[]> {
  const { items } = await resolveCampaignCatalogKernel(config, campaignId)
  return items
}

/**
 * List and management resolution: resolved entities plus `overlayFailures` for
 * system rows whose overlay did not apply. Do not drop `overlayFailures` when
 * building an authoring list response.
 */
export async function resolveContentListForCampaign<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<CampaignCatalogResolution<T>> {
  return resolveCampaignCatalogKernel(config, campaignId)
}

/** Reference validation: resolved rows plus ids omitted because overlay apply failed. Slug-keyed refs use {@link catalogOverlayFailureSlugs}. */
export async function resolveCatalogForCampaignWithOverlayContext<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<{
  records: T[]
  overlayFailures: CatalogOverlayListFailure[]
  overlayFailureIds: ReadonlySet<string>
}> {
  const { items, overlayFailures } = await resolveCampaignCatalogKernel(config, campaignId)
  return {
    records: items,
    overlayFailures,
    overlayFailureIds: new Set(overlayFailures.map((failure) => failure.targetId)),
  }
}

/** Slugs of system rows omitted from resolved records because overlay apply failed. */
export function catalogOverlayFailureSlugs(
  failures: readonly CatalogOverlayListFailure[],
): ReadonlySet<string> {
  return new Set(failures.map((failure) => failure.slug))
}
