import { collectAuthoredSpellReferences, type ContentUsageBlocker } from '@rpg/contracts'

import type { ContentUsageResolverContext } from '../content-usage-context'
import { indexRecordsByContentId } from './index-by-content-id'

type SpellReferrer = {
  /** Subclass rows use `classes` because usage blockers have no subclass content type. */
  contentTypeKey: 'species' | 'classes' | 'monsters'
  id: string
  slug: string
  name: string
  body: unknown
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
  const [species, classes, subclasses, monsters, overlaySeeds] = await Promise.all([
    import('../../../species/species.config'),
    import('../../../classes/classes.config'),
    import('../../../subclasses/subclasses.config'),
    import('../../../monsters/monsters.config'),
    import('./overlay-failure-seed-referrers'),
  ])
  const { resolveCatalogRowsWithOverlayFailureSeeds, mergeOverlayFailureSeedRows } = overlaySeeds
  const [speciesCtx, classCtx, subclassCtx, monsterCtx] = await Promise.all([
    resolveCatalogRowsWithOverlayFailureSeeds(species.speciesRegistration.read, ctx.campaignId),
    resolveCatalogRowsWithOverlayFailureSeeds(classes.classRegistration.read, ctx.campaignId),
    resolveCatalogRowsWithOverlayFailureSeeds(subclasses.subclassContentConfig, ctx.campaignId),
    resolveCatalogRowsWithOverlayFailureSeeds(monsters.monstersRegistration.read, ctx.campaignId),
  ])
  const speciesRows = mergeOverlayFailureSeedRows(
    speciesCtx.records,
    speciesCtx.overlayFailureSeeds,
  )
  const classRows = mergeOverlayFailureSeedRows(classCtx.records, classCtx.overlayFailureSeeds)
  const subclassRows = mergeOverlayFailureSeedRows(
    subclassCtx.records,
    subclassCtx.overlayFailureSeeds,
  )
  const monsterRows = mergeOverlayFailureSeedRows(
    monsterCtx.records,
    monsterCtx.overlayFailureSeeds,
  )

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
    ...monsterRows.map((row) => ({
      contentTypeKey: 'monsters' as const,
      id: row.id,
      slug: row.slug,
      name: row.name,
      body: row,
    })),
  ]

  return indexRecordsByContentId(referrers, spellIdsFromReferrer, toSpellReferrerBlocker)
}
