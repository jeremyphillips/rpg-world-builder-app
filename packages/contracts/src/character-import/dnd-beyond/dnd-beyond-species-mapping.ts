import { DND_BEYOND_SRD_TOOL_RULESET_ID } from './dnd-beyond-tool-mapping'
import type { DndBeyondRace } from './dnd-beyond-character.schema'

// ---------------------------------------------------------------------------
// D&D Beyond stores species on data.race — map to local catalog slug/id.
// ---------------------------------------------------------------------------

const DDB_SPECIES_SLUG_PREFIX = /^\d+-(.+)$/

export function inferLocalSpeciesSlug(race: DndBeyondRace): string | undefined {
  const slug = race.slug?.trim()
  if (slug) {
    const prefixed = slug.match(DDB_SPECIES_SLUG_PREFIX)
    if (prefixed?.[1]) return prefixed[1].toLowerCase()
    return slug.toLowerCase()
  }

  const baseName = race.baseRaceName?.trim() || race.baseName?.trim() || race.fullName?.trim()
  if (!baseName) return undefined

  return baseName.toLowerCase().replace(/\s+/g, '-')
}

export function inferLocalSpeciesId(race: DndBeyondRace): string | undefined {
  const localSlug = inferLocalSpeciesSlug(race)
  if (!localSlug) return undefined
  return `${DND_BEYOND_SRD_TOOL_RULESET_ID}:${localSlug}`
}

export function readDndBeyondSpeciesLabel(race: DndBeyondRace): string | undefined {
  return race.fullName?.trim() || race.baseRaceName?.trim() || race.baseName?.trim() || undefined
}
