import {
  collectAuthoredSpellReferences,
  type ContentUsageBlocker,
  type Species,
  type CharacterClass,
  type Subclass,
} from '@rpg/contracts'

import type { ContentUsageResolverContext } from '../content-usage-context'
import { indexRecordsByContentId } from './index-by-content-id'

type SpellReferrer = {
  /** Subclass rows use `classes` because usage blockers have no subclass content type. */
  contentTypeKey: 'species' | 'classes'
  id: string
  slug: string
  name: string
  body: Species | CharacterClass | Subclass
}

function spellIdsFromReferrer(referrer: SpellReferrer): string[] {
  return collectAuthoredSpellReferences(referrer.body).map((ref) => ref.spellId)
}

function toSpellReferrerBlocker(referrer: SpellReferrer): ContentUsageBlocker {
  return {
    kind: 'content',
    contentTypeKey: referrer.contentTypeKey,
    id: referrer.id,
    slug: referrer.slug,
    label: referrer.name,
  }
}

/** Blocks deleting a spell that a species, class, or subclass grant or recommendation names. */
export async function indexContentSpellReferenceBlockersByContentId(
  ctx: ContentUsageResolverContext,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const [{ resolveCatalogForCampaign }, species, classes, subclasses] = await Promise.all([
    import('../../../content.service'),
    import('../../../species/species.config'),
    import('../../../classes/classes.config'),
    import('../../../subclasses/subclasses.config'),
  ])
  const [speciesRows, classRows, subclassRows] = await Promise.all([
    resolveCatalogForCampaign(species.speciesRegistration.read, ctx.campaignId),
    resolveCatalogForCampaign(classes.classRegistration.read, ctx.campaignId),
    resolveCatalogForCampaign(subclasses.subclassContentConfig, ctx.campaignId),
  ])

  const referrers: SpellReferrer[] = [
    ...speciesRows.map((row) => ({
      contentTypeKey: 'species' as const,
      id: row.id,
      slug: row.slug,
      name: row.name,
      body: row,
    })),
    ...classRows.map((row) => ({
      contentTypeKey: 'classes' as const,
      id: row.id,
      slug: row.slug,
      name: row.name,
      body: row,
    })),
    ...subclassRows.map((row) => ({
      contentTypeKey: 'classes' as const,
      id: row.id,
      slug: row.slug,
      name: row.name,
      body: row,
    })),
  ]

  return indexRecordsByContentId(referrers, spellIdsFromReferrer, toSpellReferrerBlocker)
}
