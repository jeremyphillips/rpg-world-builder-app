import { z } from 'zod'
import { classSchema, subclassSchema } from '@rpg/contracts'
import type { CharacterClass, Subclass, SystemRulesetId } from '@rpg/contracts'

import classesRaw from './data/srd-cc-5.2.1/classes.json'
import subclassesRaw from './data/srd-cc-5.2.1/subclasses.json'

// Validate the shipped catalog against the contract at module load, so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521_CLASSES = z.array(classSchema).parse(classesRaw)
const SRD_521_SUBCLASSES = z.array(subclassSchema).parse(subclassesRaw)

interface RulesetSeed {
  classes: CharacterClass[]
  subclasses: Subclass[]
}

// Registry keyed by ruleset id — adding a future ruleset is a data + entry
// change here, not a rewrite of the loaders.
const SEED_BY_RULESET = {
  'srd-cc-5.2.1': { classes: SRD_521_CLASSES, subclasses: SRD_521_SUBCLASSES },
} as const satisfies Record<SystemRulesetId, RulesetSeed>

export function loadSeedClasses(rulesetId: SystemRulesetId): CharacterClass[] {
  return SEED_BY_RULESET[rulesetId].classes
}

export function loadSeedSubclasses(rulesetId: SystemRulesetId): Subclass[] {
  return SEED_BY_RULESET[rulesetId].subclasses
}

/** Subclasses belonging to one parent class, identified by the class's opaque id. */
export function loadSubclassesByClassId(rulesetId: SystemRulesetId, classId: string): Subclass[] {
  return loadSeedSubclasses(rulesetId).filter((s) => s.classId === classId)
}

/** System class slugs for a ruleset — used by the homebrew slug guard. */
export function seedClassSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedClasses(rulesetId).map((c) => c.slug))
}
