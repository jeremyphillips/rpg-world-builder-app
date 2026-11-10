import { keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

/**
 * Identity and discovery copy for reusable creature traits.
 * Descriptions are add-menu summaries. Stat-block sentences live on the preset.
 */
export const CREATURE_TRAIT_VOCABULARY_TERM = {
  label: 'Creature trait',
  description: 'A reusable stat-block trait identified for the add menu.',
  sentence: {
    singular: 'creature trait',
    plural: 'creature traits',
  },
} as const satisfies VocabularyTerm

export const CREATURE_TRAIT_GROUP_TERM = {
  label: 'Creature trait group',
  description: 'Menu group for a reusable creature trait.',
  sentence: {
    singular: 'creature trait group',
    plural: 'creature trait groups',
  },
} as const satisfies VocabularyTerm

export const CREATURE_TRAIT_GROUP_ENTRIES = {
  environment: {
    label: 'Environment',
    description: 'Breath, light, and terrain.',
  },
  movement: {
    label: 'Movement',
    description: 'How the creature moves.',
  },
  combat: {
    label: 'Combat',
    description: 'Attacks, damage, and survival.',
  },
  form: {
    label: 'Form',
    description: 'The creature’s shape.',
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureTraitGroup = keyof typeof CREATURE_TRAIT_GROUP_ENTRIES

export const CREATURE_TRAIT_GROUPS = keysFromEntries(CREATURE_TRAIT_GROUP_ENTRIES)

export type CreatureTraitVocabularyEntry = GameTermEntry & {
  readonly group: CreatureTraitGroup
}

export const CREATURE_TRAIT_VOCABULARY_ENTRIES = {
  amphibious: {
    label: 'Amphibious',
    description: 'Breathes air and water.',
    group: 'environment',
  },
  'ice-walk': {
    label: 'Ice Walk',
    description: 'Climbs ice; no extra cost on ice or snow.',
    group: 'environment',
  },
  'sunlight-sensitivity': {
    label: 'Sunlight Sensitivity',
    description: 'Disadvantage on checks and attacks in sunlight.',
    group: 'environment',
  },
  agile: {
    label: 'Agile',
    description: 'Leaves reach without Opportunity Attacks.',
    group: 'movement',
  },
  amorphous: {
    label: 'Amorphous',
    description: 'Moves through 1-inch spaces without slowing.',
    group: 'movement',
  },
  'earth-glide': {
    label: 'Earth Glide',
    description: 'Burrows through unworked earth and stone.',
    group: 'movement',
  },
  flyby: {
    label: 'Flyby',
    description: 'Flying out of reach avoids Opportunity Attacks.',
    group: 'movement',
  },
  'incorporeal-movement': {
    label: 'Incorporeal Movement',
    description: 'Passes through creatures and objects.',
    group: 'movement',
  },
  'running-leap': {
    label: 'Running Leap',
    description: 'Jumps 25 ft. after a 10-ft. run.',
    group: 'movement',
  },
  'spider-climb': {
    label: 'Spider Climb',
    description: 'Climbs walls and ceilings without checks.',
    group: 'movement',
  },
  tunneler: {
    label: 'Tunneler',
    description: 'Burrows through rock; leaves a 10-ft. tunnel.',
    group: 'movement',
  },
  'web-walker': {
    label: 'Web Walker',
    description: 'Ignores webs; senses creatures on the same web.',
    group: 'movement',
  },
  'lightning-absorption': {
    label: 'Lightning Absorption',
    description: 'Regains HP from Lightning damage.',
    group: 'combat',
  },
  'magic-resistance': {
    label: 'Magic Resistance',
    description: 'Advantage on saves against magic.',
    group: 'combat',
  },
  'pack-tactics': {
    label: 'Pack Tactics',
    description: 'Advantage when an ally is beside the target.',
    group: 'combat',
  },
  'siege-monster': {
    label: 'Siege Monster',
    description: 'Double damage to objects and structures.',
    group: 'combat',
  },
  'undead-fortitude': {
    label: 'Undead Fortitude',
    description: 'Con save can leave it at 1 HP instead of 0.',
    group: 'combat',
  },
  'immutable-form': {
    label: 'Immutable Form',
    description: 'Cannot shape-shift.',
    group: 'form',
  },
  'hold-breath': {
    label: 'Hold Breath',
    description: 'Holds its breath for a set time.',
    group: 'environment',
  },
  illumination: {
    label: 'Illumination',
    description: 'Sheds bright and dim light.',
    group: 'environment',
  },
  'water-breathing': {
    label: 'Water Breathing',
    description: 'Breathes only underwater.',
    group: 'environment',
  },
  'standing-leap': {
    label: 'Standing Leap',
    description: 'Long- and high-jumps without a run.',
    group: 'movement',
  },
  'legendary-resistance': {
    label: 'Legendary Resistance',
    description: 'Can succeed on a failed save.',
    group: 'combat',
  },
  regeneration: {
    label: 'Regeneration',
    description: 'Regains Hit Points at the start of its turn.',
    group: 'combat',
  },
  'regeneration-halt': {
    label: 'Regeneration (Acid/Fire)',
    description: 'Acid or Fire interrupts regeneration.',
    group: 'combat',
  },
  swarm: {
    label: 'Swarm',
    description: 'Occupies spaces; passes through tiny gaps.',
    group: 'form',
  },
} as const satisfies Record<string, CreatureTraitVocabularyEntry>

export type CreatureTraitVocabularyId = keyof typeof CREATURE_TRAIT_VOCABULARY_ENTRIES

export const CREATURE_TRAIT_VOCABULARY_IDS = keysFromEntries(CREATURE_TRAIT_VOCABULARY_ENTRIES)

export function getCreatureTraitVocabularyEntry(
  id: string,
): CreatureTraitVocabularyEntry | undefined {
  return CREATURE_TRAIT_VOCABULARY_ENTRIES[id as CreatureTraitVocabularyId]
}

export function getCreatureTraitGroupEntry(id: string): GameTermEntry | undefined {
  return CREATURE_TRAIT_GROUP_ENTRIES[id as CreatureTraitGroup]
}
