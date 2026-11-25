import { loadSeedClasses, loadSeedSubclasses } from '@rpg/catalog/classes'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { loadSeedFeats } from '@rpg/catalog/feats'
import { loadSeedMonsters } from '@rpg/catalog/monsters'
import { loadSeedSkillProficiencies } from '@rpg/catalog/skill-proficiencies'
import { loadSeedSpecies } from '@rpg/catalog/species'
import { loadSeedSpells } from '@rpg/catalog/spells'
import type { ContentTypeKey, SystemRulesetId } from '@rpg/contracts'

type SeedEntity = { id: string }

const LOADERS: Partial<
  Record<ContentTypeKey, (rulesetId: SystemRulesetId) => readonly SeedEntity[]>
> = {
  monsters: loadSeedMonsters,
  species: loadSeedSpecies,
  classes: loadSeedClasses,
  spells: loadSeedSpells,
  equipment: loadSeedEquipment,
  feats: loadSeedFeats,
  'skill-proficiencies': loadSeedSkillProficiencies,
}

export function resolveCatalogSeedBody(
  routeKey: ContentTypeKey,
  rulesetId: SystemRulesetId,
  entityId: string,
): Record<string, unknown> | undefined {
  const load = LOADERS[routeKey]
  if (!load) return undefined
  const seed = load(rulesetId).find((row) => row.id === entityId)
  return seed ? (seed as unknown as Record<string, unknown>) : undefined
}

export function resolveSubclassCatalogSeedBody(
  rulesetId: SystemRulesetId,
  entityId: string,
): Record<string, unknown> | undefined {
  const seed = loadSeedSubclasses(rulesetId).find((row) => row.id === entityId)
  return seed ? (seed as unknown as Record<string, unknown>) : undefined
}
