import { z } from 'zod'
import { spellSchema } from '@rpg/contracts'
import type { Spell, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import level0AFRaw from './data/srd-cc-5.2.1/level-0-a-f.json'
import level0GMRaw from './data/srd-cc-5.2.1/level-0-g-m.json'
import level0PTRaw from './data/srd-cc-5.2.1/level-0-p-t.json'
import level1AFRaw from './data/srd-cc-5.2.1/level-1-a-f.json'
import level1FIRaw from './data/srd-cc-5.2.1/level-1-f-i.json'
import level1IPRaw from './data/srd-cc-5.2.1/level-1-i-p.json'
import level1RTRaw from './data/srd-cc-5.2.1/level-1-r-t.json'
import level2Raw from './data/srd-cc-5.2.1/level-2.json'
import level3Raw from './data/srd-cc-5.2.1/level-3.json'
import level4Raw from './data/srd-cc-5.2.1/level-4.json'
import level5Raw from './data/srd-cc-5.2.1/level-5.json'
import level6Raw from './data/srd-cc-5.2.1/level-6.json'
import level7Raw from './data/srd-cc-5.2.1/level-7.json'
import level8Raw from './data/srd-cc-5.2.1/level-8.json'
import level9Raw from './data/srd-cc-5.2.1/level-9.json'

const spellArraySchema = z.array(spellSchema)

const SRD_521_LEVEL_0 = spellArraySchema.parse([...level0AFRaw, ...level0GMRaw, ...level0PTRaw])

const SRD_521_LEVEL_1 = spellArraySchema.parse([
  ...level1AFRaw,
  ...level1FIRaw,
  ...level1IPRaw,
  ...level1RTRaw,
])

const SRD_521_BY_LEVEL = {
  0: SRD_521_LEVEL_0,
  1: SRD_521_LEVEL_1,
  2: spellArraySchema.parse(level2Raw),
  3: spellArraySchema.parse(level3Raw),
  4: spellArraySchema.parse(level4Raw),
  5: spellArraySchema.parse(level5Raw),
  6: spellArraySchema.parse(level6Raw),
  7: spellArraySchema.parse(level7Raw),
  8: spellArraySchema.parse(level8Raw),
  9: spellArraySchema.parse(level9Raw),
} as const

const SRD_521_SPELLS = [
  ...SRD_521_BY_LEVEL[0],
  ...SRD_521_BY_LEVEL[1],
  ...SRD_521_BY_LEVEL[2],
  ...SRD_521_BY_LEVEL[3],
  ...SRD_521_BY_LEVEL[4],
  ...SRD_521_BY_LEVEL[5],
  ...SRD_521_BY_LEVEL[6],
  ...SRD_521_BY_LEVEL[7],
  ...SRD_521_BY_LEVEL[8],
  ...SRD_521_BY_LEVEL[9],
]

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521_SPELLS,
} as const satisfies Record<SystemRulesetId, Spell[]>

/** Per-level seed files for a ruleset (validated at module load). */
export const SPELL_LEVEL_FILES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export type SpellLevelFile = (typeof SPELL_LEVEL_FILES)[number]

export function loadSeedSpellsByLevel(rulesetId: SystemRulesetId, level: SpellLevelFile): Spell[] {
  if (rulesetId !== 'srd-cc-5.2.1') {
    throw new Error(`No spell seed for ruleset ${rulesetId}`)
  }
  return [...SRD_521_BY_LEVEL[level]]
}

export function loadSeedSpells(rulesetId: SystemRulesetId): Spell[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System spell slugs for a ruleset — used by the homebrew slug guard. */
export function seedSpellSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedSpells(rulesetId).map((s) => s.slug))
}

export function getSpellBySlug(rulesetId: SystemRulesetId, slug: string): Spell {
  return getBySlug(loadSeedSpells, rulesetId, slug, 'Spell')
}

export {
  SRD_521_SPELL_LEVEL_0_SHARD_FILES,
  SRD_521_SPELL_LEVEL_1_SHARD_FILES,
  SRD_521_SPELL_LEVEL_SEED_FILES,
  type Srd521SpellLevelSeedFile,
} from './spell-level-seed-files'
export {
  SRD_521_SPELL_SEED_RESOLUTION_DEFERRED_SLUGS,
  SRD_521_SPELL_SEED_RESOLUTION_MANIFEST_SLUGS,
  SRD_521_SPELL_SEED_RESOLUTION_SLUGS,
  SRD_521_SPELL_SEED_RESOLUTION_TIER_A_SLUGS,
  SPELL_RESOLUTION_DEFER_REASONS,
  spellSeedResolutionDeferReason,
  type SpellResolutionDeferReason,
} from './spell-seed-resolution'
export {
  SRD_521_SPELL_SEED_PROGRESSION,
  SRD_521_SPELL_SEED_PROGRESSION_SLUGS,
  resolveSpellSeedProgression,
} from './spell-seed-progression'
export {
  buildSpellModelingAudit,
  generateSpellModelingReport,
  spellModelingAuditViolations,
  validateSpellModelingConsistency,
} from './spell-modeling-audit'
export {
  SRD_521_SPELL_MODELING_EDITOR_ELIGIBLE_SLUGS,
  SRD_521_SPELL_MODELING_MANIFEST,
  SRD_521_SPELL_MODELING_MANIFEST_SLUGS,
  SRD_521_SPELL_MODELING_REVIEWED_AT,
} from './spell-modeling-manifest'
