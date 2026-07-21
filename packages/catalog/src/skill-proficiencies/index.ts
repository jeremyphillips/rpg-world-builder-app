import { z } from 'zod'
import { skillProficiencySchema } from '@rpg/contracts'
import { getContentTypeTerm, type SkillProficiency, type SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import skillProficienciesRaw from './data/srd-cc-5.2.1/skill-proficiencies.json'

// Validate the shipped catalog against the contract at module load, so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521_SKILL_PROFICIENCIES = z.array(skillProficiencySchema).parse(skillProficienciesRaw)

// Registry keyed by ruleset id — adding a future ruleset is a data + entry
// change here, not a rewrite of the loaders.
const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521_SKILL_PROFICIENCIES,
} as const satisfies Record<SystemRulesetId, SkillProficiency[]>

export function loadSeedSkillProficiencies(rulesetId: SystemRulesetId): SkillProficiency[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System skill proficiency slugs for a ruleset — used by the homebrew slug guard. */
export function seedSkillProficiencySlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedSkillProficiencies(rulesetId).map((s) => s.slug))
}

export function getSkillProficiencyBySlug(
  rulesetId: SystemRulesetId,
  slug: string,
): SkillProficiency {
  return getBySlug(
    loadSeedSkillProficiencies,
    rulesetId,
    slug,
    getContentTypeTerm('skill-proficiencies').label,
  )
}
