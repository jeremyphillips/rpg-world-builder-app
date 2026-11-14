import { keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

import { CREATURE_TRAIT_SEARCH_TERMS } from './trait-vocabulary-search-terms'

/**
 * Identity and discovery copy for reusable creature traits.
 * Descriptions are add-menu summaries. Stat-block sentences live on the preset.
 * Curated picker keywords live in `trait-vocabulary-search-terms.ts`.
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
  general: {
    label: 'General',
    description: 'Other reusable traits.',
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureTraitGroup = keyof typeof CREATURE_TRAIT_GROUP_ENTRIES

export const CREATURE_TRAIT_GROUPS = keysFromEntries(CREATURE_TRAIT_GROUP_ENTRIES)

export type CreatureTraitVocabularyEntry = GameTermEntry & {
  readonly group: CreatureTraitGroup
  readonly searchTerms?: readonly string[]
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
  abduct: {
    label: 'Abduct',
    description: 'Moves grappled creatures at no extra cost.',
    group: 'movement',
  },
  'divine-awareness': {
    label: 'Divine Awareness',
    description: 'Knows when it hears a lie.',
    group: 'general',
  },
  inscrutable: {
    label: 'Inscrutable',
    description: 'Blocks remote observation; Insight is harder.',
    group: 'general',
  },
  'demonic-restoration': {
    label: 'Demonic Restoration',
    description: 'Reforms instantly in the Abyss.',
    group: 'form',
  },
  'diabolical-restoration': {
    label: 'Diabolical Restoration',
    description: 'Reforms instantly in the Nine Hells.',
    group: 'form',
  },
  'exalted-restoration': {
    label: 'Exalted Restoration',
    description: 'Reforms instantly in Mount Celestia.',
    group: 'form',
  },
  'fiendish-restoration': {
    label: 'Fiendish Restoration',
    description: 'Reforms instantly in the Nine Hells.',
    group: 'form',
  },
  wishes: {
    label: 'Wishes',
    description: 'May know Wish and cast it for others.',
    group: 'general',
  },
  compression: {
    label: 'Compression',
    description: 'Moves through 1-inch spaces without slowing.',
    group: 'movement',
  },
  'blood-frenzy': {
    label: 'Blood Frenzy',
    description: 'Advantage against wounded creatures.',
    group: 'combat',
  },
  'bloodied-frenzy': {
    label: 'Bloodied Frenzy',
    description: 'Advantage on attacks and saves if Bloodied.',
    group: 'combat',
  },
  'beast-of-burden': {
    label: 'Beast of Burden',
    description: 'Carries as if one size larger.',
    group: 'general',
  },
  jumper: {
    label: 'Jumper',
    description: 'Jump distance uses Dexterity.',
    group: 'movement',
  },
  ephemeral: {
    label: 'Ephemeral',
    description: 'Cannot wear or carry anything.',
    group: 'form',
  },
  invisibility: {
    label: 'Invisibility',
    description: 'Has the Invisible condition.',
    group: 'form',
  },
  'light-sensitivity': {
    label: 'Light Sensitivity',
    description: 'Disadvantage on attacks in bright light.',
    group: 'combat',
  },
  'limited-amphibiousness': {
    label: 'Limited Amphibiousness',
    description: 'Breathes air and water; must submerge.',
    group: 'environment',
  },
  'blurred-form': {
    label: 'Blurred Form',
    description: 'Attacks against it have Disadvantage.',
    group: 'form',
  },
  reactive: {
    label: 'Reactive',
    description: 'One Reaction on every turn.',
    group: 'combat',
  },
  evasion: {
    label: 'Evasion',
    description: 'Avoids damage when a Dex save halves it.',
    group: 'combat',
  },
  'speak-with-beasts-and-plants': {
    label: 'Speak with Beasts and Plants',
    description: 'Talks with Beasts and Plants.',
    group: 'form',
  },
  freeze: {
    label: 'Freeze',
    description: 'Cold damage temporarily reduces its Speed.',
    group: 'combat',
  },
  'fire-absorption': {
    label: 'Fire Absorption',
    description: 'Regains HP from Fire damage.',
    group: 'combat',
  },
  'acid-absorption': {
    label: 'Acid Absorption',
    description: 'Acid damage heals it instead.',
    group: 'combat',
  },
  'water-form': {
    label: 'Water Form',
    description: 'Enters enemy spaces and squeezes through.',
    group: 'movement',
  },
  'heat-aura': {
    label: 'Heat Aura',
    description: 'Nearby creatures take Fire damage.',
    group: 'combat',
  },
  'death-throes': {
    label: 'Death Throes',
    description: 'Explodes on death, then reforms.',
    group: 'combat',
  },
  'mucus-cloud': {
    label: 'Mucus Cloud',
    description: 'Underwater cloud curses nearby creatures.',
    group: 'combat',
  },
  'aberrant-ground': {
    label: 'Aberrant Ground',
    description: 'Nearby ground is Difficult Terrain.',
    group: 'environment',
  },
  'aura-of-authority': {
    label: 'Aura of Authority',
    description: 'Gives itself and allies Advantage on attacks and saves.',
    group: 'combat',
  },
  'barbed-hide': {
    label: 'Barbed Hide',
    description: 'Damages creatures grappling with it.',
    group: 'combat',
  },
  'fear-aura': {
    label: 'Fear Aura',
    description: 'Frightens enemies that start their turn nearby.',
    group: 'combat',
  },
  'vile-appearance': {
    label: 'Vile Appearance',
    description: 'Frightens beasts and humanoids that see it.',
    group: 'combat',
  },
  'bloodied-fury': {
    label: 'Bloodied Fury',
    description: 'Advantage on attacks while Bloodied.',
    group: 'combat',
  },
  'ethereal-sight': {
    label: 'Ethereal Sight',
    description: 'Sees into the Ethereal Plane.',
    group: 'environment',
  },
  mimicry: {
    label: 'Mimicry',
    description: 'Copies sounds; Insight reveals imitations.',
    group: 'form',
  },
  'air-form': {
    label: 'Air Form',
    description: 'Enters occupied spaces and squeezes.',
    group: 'movement',
  },
  berserk: {
    label: 'Berserk',
    description: 'May lose control when Bloodied.',
    group: 'combat',
  },
  'elemental-restoration': {
    label: 'Elemental Restoration',
    description: 'Returns to its home plane days later.',
    group: 'form',
  },
  stench: {
    label: 'Stench',
    description: 'Sickens creatures that start their turn nearby.',
    group: 'combat',
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

export function getCreatureTraitSearchTerms(id: string): readonly string[] {
  const fromEntry = getCreatureTraitVocabularyEntry(id)?.searchTerms
  if (fromEntry?.length) return fromEntry
  return CREATURE_TRAIT_SEARCH_TERMS[id as keyof typeof CREATURE_TRAIT_SEARCH_TERMS] ?? []
}
