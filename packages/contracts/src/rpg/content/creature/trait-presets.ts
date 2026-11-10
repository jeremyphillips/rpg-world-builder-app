import {
  CREATURE_TRAIT_VOCABULARY_IDS,
  type CreatureTraitVocabularyId,
} from '../../vocab/creature/trait-vocabulary'

/** Stat-block sentence for a fixed creature trait. Labels live on the vocabulary entry. */
type CreatureTraitPreset = {
  sentence: (subject: string) => string
}

function capitalSubject(subject: string): string {
  if (!subject) return subject
  return subject.charAt(0).toUpperCase() + subject.slice(1)
}

export const CREATURE_TRAIT_PRESET_ENTRIES = {
  amphibious: {
    sentence: (subject) => `${capitalSubject(subject)} can breathe air and water.`,
  },
  'ice-walk': {
    sentence: (subject) =>
      `${capitalSubject(subject)} can move across and climb icy surfaces without needing to make an ability check. Additionally, Difficult Terrain composed of ice or snow doesn't cost it extra movement.`,
  },
  'sunlight-sensitivity': {
    sentence: (subject) =>
      `While in sunlight, ${subject} has Disadvantage on ability checks and attack rolls.`,
  },
  agile: {
    sentence: (subject) =>
      `${capitalSubject(subject)} doesn't provoke an Opportunity Attack when it moves out of an enemy's reach.`,
  },
  amorphous: {
    sentence: (subject) =>
      `${capitalSubject(subject)} can move through a space as narrow as 1 inch without expending extra movement to do so.`,
  },
  'earth-glide': {
    sentence: (subject) =>
      `${capitalSubject(subject)} can burrow through nonmagical, unworked earth and stone. While doing so, it doesn't disturb the material it moves through.`,
  },
  flyby: {
    sentence: (subject) =>
      `${capitalSubject(subject)} doesn't provoke an Opportunity Attack when it flies out of an enemy's reach.`,
  },
  'incorporeal-movement': {
    sentence: (subject) =>
      `${capitalSubject(subject)} can move through other creatures and objects as if they were Difficult Terrain. It takes 5 (1d10) Force damage if it ends its turn inside an object.`,
  },
  'running-leap': {
    sentence: (subject) => `With a 10-foot running start, ${subject} can Long Jump up to 25 feet.`,
  },
  'spider-climb': {
    sentence: (subject) =>
      `${capitalSubject(subject)} can climb difficult surfaces, including along ceilings, without needing to make an ability check.`,
  },
  tunneler: {
    sentence: (subject) =>
      `${capitalSubject(subject)} can burrow through solid rock at half its Burrow Speed and leaves a 10-foot-diameter tunnel in its wake.`,
  },
  'web-walker': {
    sentence: (subject) =>
      `${capitalSubject(subject)} ignores movement restrictions caused by webs, and it knows the location of any other creature in contact with the same web.`,
  },
  'lightning-absorption': {
    sentence: (subject) =>
      `Whenever ${subject} is subjected to Lightning damage, it regains a number of Hit Points equal to the Lightning damage dealt.`,
  },
  'magic-resistance': {
    sentence: (subject) =>
      `${capitalSubject(subject)} has Advantage on saving throws against spells and other magical effects.`,
  },
  'pack-tactics': {
    sentence: (subject) =>
      `${capitalSubject(subject)} has Advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.`,
  },
  'siege-monster': {
    sentence: (subject) =>
      `${capitalSubject(subject)} deals double damage to objects and structures.`,
  },
  'undead-fortitude': {
    sentence: (subject) =>
      `If damage reduces ${subject} to 0 Hit Points, it makes a Constitution saving throw (DC 5 plus the damage taken) unless the damage is Radiant or from a Critical Hit. On a successful save, it drops to 1 Hit Point instead.`,
  },
  'immutable-form': {
    sentence: (subject) => `${capitalSubject(subject)} can't shape-shift.`,
  },
  'hold-breath': { sentence: () => '' },
  illumination: { sentence: () => '' },
  'water-breathing': { sentence: () => '' },
  'standing-leap': { sentence: () => '' },
  'legendary-resistance': { sentence: () => '' },
  regeneration: { sentence: () => '' },
  'regeneration-halt': { sentence: () => '' },
  swarm: { sentence: () => '' },
} as const satisfies Record<CreatureTraitVocabularyId, CreatureTraitPreset>

export const CONFIGURABLE_CREATURE_TRAIT_PRESET_IDS = [
  'legendary-resistance',
  'hold-breath',
  'illumination',
  'standing-leap',
  'swarm',
  'regeneration',
  'regeneration-halt',
  'water-breathing',
] as const satisfies readonly CreatureTraitVocabularyId[]

const CONFIGURABLE_CREATURE_TRAIT_PRESET_ID_SET = new Set<string>(
  CONFIGURABLE_CREATURE_TRAIT_PRESET_IDS,
)

export function isConfigurableCreatureTraitPreset(presetId: string): boolean {
  return CONFIGURABLE_CREATURE_TRAIT_PRESET_ID_SET.has(presetId)
}

export type CreatureTraitPresetId = keyof typeof CREATURE_TRAIT_PRESET_ENTRIES

export const CREATURE_TRAIT_PRESET_IDS = CREATURE_TRAIT_VOCABULARY_IDS

export function getCreatureTraitPresetSentence(
  presetId: string,
  subject: string,
): string | undefined {
  if (isConfigurableCreatureTraitPreset(presetId)) return undefined
  return CREATURE_TRAIT_PRESET_ENTRIES[presetId as CreatureTraitPresetId]?.sentence(subject)
}
