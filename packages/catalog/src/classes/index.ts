import { z } from 'zod'
import { classSchema, classStoredSchema, subclassSchema } from '@rpg/contracts'
import type { CharacterClass, ClassStored, Subclass, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import classesRaw from './data/srd-cc-5.2.1/classes.json'
import subclassesRaw from './data/srd-cc-5.2.1/subclasses.json'

// Validate the shipped catalog against the stored contract at module load.
const SRD_521_CLASSES_STORED = z.array(classStoredSchema).parse(classesRaw)
const SRD_521_SUBCLASSES = z.array(subclassSchema).parse(subclassesRaw)

const SRD_521_CLASSES = SRD_521_CLASSES_STORED.map((cls) => classSchema.parse(cls))

interface RulesetSeed {
  classesStored: ClassStored[]
  classes: CharacterClass[]
  subclasses: Subclass[]
}

// Registry keyed by ruleset id — adding a future ruleset is a data + entry
// change here, not a rewrite of the loaders.
const SEED_BY_RULESET = {
  'srd-cc-5.2.1': {
    classesStored: SRD_521_CLASSES_STORED,
    classes: SRD_521_CLASSES,
    subclasses: SRD_521_SUBCLASSES,
  },
} as const satisfies Record<SystemRulesetId, RulesetSeed>

export function loadSeedClassesStored(rulesetId: SystemRulesetId): ClassStored[] {
  return SEED_BY_RULESET[rulesetId].classesStored
}

/** Read models — same persisted shape as stored (class-owned skill choices). */
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

export function getClassBySlug(rulesetId: SystemRulesetId, slug: string): CharacterClass {
  return getBySlug(loadSeedClasses, rulesetId, slug, 'Class')
}

export function getSubclassBySlug(rulesetId: SystemRulesetId, slug: string): Subclass {
  return getBySlug(loadSeedSubclasses, rulesetId, slug, 'Subclass')
}
