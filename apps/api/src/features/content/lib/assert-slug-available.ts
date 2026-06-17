import { HttpError } from '../../../lib/http-error'

interface SlugAvailabilityInput {
  /** The proposed homebrew slug. */
  slug: string
  /** System slugs for the campaign's ruleset (homebrew may not shadow these). */
  systemSlugs: ReadonlySet<string>
  /** Existing homebrew slugs for this (campaignId, rulesetId). */
  campaignSlugs: ReadonlySet<string>
}

/**
 * Enforce homebrew slug uniqueness within a campaign's resolved catalog
 * (type-agnostic; depends only on envelope fields). A homebrew slug must not
 * collide with another homebrew slug in the same campaign, nor shadow a system
 * slug — changing system content is done by patching, not shadowing.
 *
 * Throws a 409 `HttpError` on conflict; reused by every content type's authoring
 * path. (Write endpoints are a later phase; this is the shared guard they call.)
 */
export function assertSlugAvailable({
  slug,
  systemSlugs,
  campaignSlugs,
}: SlugAvailabilityInput): void {
  if (systemSlugs.has(slug)) {
    throw new HttpError(
      409,
      'slug_conflict',
      `"${slug}" is a system slug. Patch the system entry instead of creating homebrew that shadows it.`,
    )
  }
  if (campaignSlugs.has(slug)) {
    throw new HttpError(
      409,
      'slug_conflict',
      `"${slug}" is already used by homebrew in this campaign.`,
    )
  }
}
