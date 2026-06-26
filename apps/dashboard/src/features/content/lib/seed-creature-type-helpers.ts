import {
  CREATURE_TYPES,
  getSeedCreatureTypeLabel,
  loadSeedCreatureTypes,
} from '@rpg/catalog/vocabulary'
import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'

/** System ruleset used until campaign-resolved vocabulary is wired (Phase 6). */
const SEED_RULESET = DEFAULT_SYSTEM_RULESET_ID

export { CREATURE_TYPES }

/** Seed label lookup — replace with campaign-resolved vocabulary when available. */
export function getSeedCreatureTypeDisplayLabel(id: string): string {
  return getSeedCreatureTypeLabel(SEED_RULESET, id)
}

/** Id → label map for form and table option lists. */
export function seedCreatureTypeLabelMap(): Record<string, string> {
  return Object.fromEntries(
    loadSeedCreatureTypes(SEED_RULESET).options.map((option) => [option.id, option.label]),
  )
}
