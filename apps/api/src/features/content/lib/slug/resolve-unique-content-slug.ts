import type { ApiContentTypeKey } from '@rpg/contracts'
import { dedupeContentKey, deriveContentKey, slugSchema } from '@rpg/contracts'

import { HttpError } from '../../../../lib/http-error'
import { findCampaignById } from '../../../campaign'
import { getContentTypeConfig } from '../../content-types'
import { assertSlugAvailable } from '../assert-slug-available'

export type ContentSlugCollisionPolicy = 'reject' | 'suffix'

declare const ResolvedContentSlugBrand: unique symbol

/** Branded slug validated at the API write boundary — not a public raw string option. */
export type ResolvedContentSlug = string & { readonly [ResolvedContentSlugBrand]: true }

export function asResolvedContentSlug(slug: string): ResolvedContentSlug {
  return slugSchema.parse(slug) as ResolvedContentSlug
}

export interface ResolveUniqueContentSlugInput {
  contentType: ApiContentTypeKey
  campaignId: string
  name: string
  collisionPolicy: ContentSlugCollisionPolicy
}

async function loadSlugSets(
  contentType: ApiContentTypeKey,
  campaignId: string,
  rulesetId: Parameters<ReturnType<typeof getContentTypeConfig>['systemSlugs']>[0],
): Promise<{ systemSlugs: ReadonlySet<string>; campaignSlugs: ReadonlySet<string> }> {
  const config = getContentTypeConfig(contentType)
  const homebrew = await config.loadHomebrew(campaignId, rulesetId)
  return {
    systemSlugs: config.systemSlugs(rulesetId),
    campaignSlugs: new Set(homebrew.map((record) => record.slug)),
  }
}

/**
 * Resolves a unique catalog slug for the campaign scope. Candidate generation only —
 * insert races are retried in `createHomebrewContent`.
 */
export async function resolveUniqueContentSlug({
  contentType,
  campaignId,
  name,
  collisionPolicy,
}: ResolveUniqueContentSlugInput): Promise<ResolvedContentSlug> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const { systemSlugs, campaignSlugs } = await loadSlugSets(contentType, campaignId, rulesetId)
  const baseSlug = deriveContentKey(name)

  if (collisionPolicy === 'reject') {
    assertSlugAvailable({ slug: baseSlug, systemSlugs, campaignSlugs })
    return asResolvedContentSlug(baseSlug)
  }

  const used = new Set<string>([...systemSlugs, ...campaignSlugs])
  return asResolvedContentSlug(dedupeContentKey(baseSlug, used))
}

/** Re-resolve a suffix candidate after an insert race. */
export async function resolveNextSlugCandidate({
  contentType,
  campaignId,
  name,
}: Omit<ResolveUniqueContentSlugInput, 'collisionPolicy'>): Promise<ResolvedContentSlug> {
  return resolveUniqueContentSlug({
    contentType,
    campaignId,
    name,
    collisionPolicy: 'suffix',
  })
}

/** Confirms a Mongo duplicate-key error targets the homebrew slug compound index. */
export function isSlugDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const mongoError = error as { code?: number; keyPattern?: Record<string, unknown> }
  if (mongoError.code !== 11000) return false
  const keyPattern = mongoError.keyPattern ?? {}
  return 'slug' in keyPattern && 'campaignId' in keyPattern && 'rulesetId' in keyPattern
}
