import { z } from 'zod'
import { classSchema, classStoredSchema, subclassSchema, getContentTypeTerm } from '@rpg/contracts'
import type { CharacterClass, ClassStored, Subclass, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import barbarianRaw from './data/srd-cc-5.2.1/barbarian.json'
import bardRaw from './data/srd-cc-5.2.1/bard.json'
import clericRaw from './data/srd-cc-5.2.1/cleric.json'
import druidRaw from './data/srd-cc-5.2.1/druid.json'
import fighterRaw from './data/srd-cc-5.2.1/fighter.json'
import monkRaw from './data/srd-cc-5.2.1/monk.json'
import paladinRaw from './data/srd-cc-5.2.1/paladin.json'
import rangerRaw from './data/srd-cc-5.2.1/ranger.json'
import rogueRaw from './data/srd-cc-5.2.1/rogue.json'
import sorcererRaw from './data/srd-cc-5.2.1/sorcerer.json'
import warlockRaw from './data/srd-cc-5.2.1/warlock.json'
import wizardRaw from './data/srd-cc-5.2.1/wizard.json'
import subclassesRaw from './data/srd-cc-5.2.1/subclasses.json'

// Validate the shipped catalog against the stored contract at module load.
const SRD_521_CLASSES_STORED_BY_SLUG = {
  barbarian: classStoredSchema.parse(barbarianRaw),
  bard: classStoredSchema.parse(bardRaw),
  cleric: classStoredSchema.parse(clericRaw),
  druid: classStoredSchema.parse(druidRaw),
  fighter: classStoredSchema.parse(fighterRaw),
  monk: classStoredSchema.parse(monkRaw),
  paladin: classStoredSchema.parse(paladinRaw),
  ranger: classStoredSchema.parse(rangerRaw),
  rogue: classStoredSchema.parse(rogueRaw),
  sorcerer: classStoredSchema.parse(sorcererRaw),
  warlock: classStoredSchema.parse(warlockRaw),
  wizard: classStoredSchema.parse(wizardRaw),
} as const

/** Per-class seed files for a ruleset (validated at module load). */
export const CLASS_SLUG_FILES = [
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
] as const

export type ClassSlugFile = (typeof CLASS_SLUG_FILES)[number]

const SRD_521_CLASSES_STORED = CLASS_SLUG_FILES.map((slug) => SRD_521_CLASSES_STORED_BY_SLUG[slug])
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

export function loadSeedClassBySlug(
  rulesetId: SystemRulesetId,
  slug: ClassSlugFile,
): CharacterClass {
  if (rulesetId !== 'srd-cc-5.2.1') {
    throw new Error(`No class seed for ruleset ${rulesetId}`)
  }
  return classSchema.parse(SRD_521_CLASSES_STORED_BY_SLUG[slug])
}

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
  return getBySlug(loadSeedClasses, rulesetId, slug, getContentTypeTerm('classes').label)
}

export function getSubclassBySlug(rulesetId: SystemRulesetId, slug: string): Subclass {
  return getBySlug(loadSeedSubclasses, rulesetId, slug, 'Subclass')
}
