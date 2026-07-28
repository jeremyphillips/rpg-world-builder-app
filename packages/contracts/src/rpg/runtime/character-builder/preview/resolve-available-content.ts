import { resolveAllowedCreatureTypesFromPolicy } from '../../../campaign/campaign-rules'
import type { CharacterClass } from '../../../content/classes/class'
import type { Equipment } from '../../../content/equipment'
import type { Species } from '../../../content/species'
import type { Spell } from '../../../content/spell'
import type { CharacterBuildContext } from '../context'
import type { ResolvedContentCampaignAccess } from '../../../content/lib/campaign-access'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '../../../content/lib/campaign-access'
import type { ContentViewer } from '../../../content/lib/content-viewer-access'
import { isContentDiscoverableForViewer } from '../../../content/lib/content-viewer-access'

// ---------------------------------------------------------------------------
// resolveAvailableContent — availability seam for the builder UI. Campaign
// allow/deny plugs in via optional `catalogViewer` on CharacterBuildContext.
// ---------------------------------------------------------------------------

export type AvailableContent = {
  species: Species[]
  classes: CharacterClass[]
  spells: Spell[]
  equipment: Equipment[]
}

function filterSpeciesByCreatureTypePolicy(
  species: readonly Species[],
  context: CharacterBuildContext,
): Species[] {
  const allowedTypes = resolveAllowedCreatureTypesFromPolicy(
    context.characterCreationRules.species.creatureTypePolicy,
  )
  const allowed = new Set(allowedTypes)
  return species.filter((entry) => allowed.has(entry.creatureType))
}

function filterSpellsByClassSlugs(
  spells: readonly Spell[],
  classSlugs: ReadonlySet<string>,
): Spell[] {
  if (classSlugs.size === 0) return []
  return spells.filter((spell) => spell.classIds.some((slug) => classSlugs.has(slug)))
}

type DiscoverableCatalogRow = {
  status?: string
  campaignAccess?: ResolvedContentCampaignAccess
}

function filterDiscoverableCatalogItems<T extends DiscoverableCatalogRow>(
  items: readonly T[],
  viewer: ContentViewer,
): T[] {
  return items.filter((row) => {
    if (viewer.kind !== 'manage' && row.status === 'draft') {
      return false
    }

    const campaignAccess = row.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
    return isContentDiscoverableForViewer(campaignAccess, viewer)
  })
}

/** Returns catalog options filtered by resolved character-creation rules. */
export function resolveAvailableContent(context: CharacterBuildContext): AvailableContent {
  const viewer = context.catalogViewer
  let species = filterSpeciesByCreatureTypePolicy(context.catalog.species, context)
  let classes = [...context.catalog.classes]
  let equipment = [...context.catalog.equipment]

  if (viewer) {
    species = filterDiscoverableCatalogItems(species, viewer)
    classes = filterDiscoverableCatalogItems(classes, viewer)
    equipment = filterDiscoverableCatalogItems(equipment, viewer)
  }

  const classSlugs = new Set(classes.map((entry) => entry.slug))
  let spells = filterSpellsByClassSlugs(context.catalog.spells, classSlugs)
  if (viewer) {
    spells = filterDiscoverableCatalogItems(spells, viewer)
  }

  return {
    species,
    classes,
    spells,
    equipment,
  }
}
