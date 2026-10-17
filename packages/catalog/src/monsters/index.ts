import { z } from 'zod'
import { getContentTypeTerm, monsterSchema } from '@rpg/contracts'
import type { Monster, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import monstersRaw from './data/srd-cc-5.2.1/monsters.json'

const SRD_521 = z.array(monsterSchema).parse(monstersRaw) as Monster[]

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521,
} as const satisfies Record<SystemRulesetId, Monster[]>

export function loadSeedMonsters(rulesetId: SystemRulesetId): Monster[] {
  return SEED_BY_RULESET[rulesetId]
}

export function seedMonsterSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedMonsters(rulesetId).map((monster) => monster.slug))
}

export function getMonsterBySlug(rulesetId: SystemRulesetId, slug: string): Monster {
  return getBySlug(loadSeedMonsters, rulesetId, slug, getContentTypeTerm('monsters').label)
}
