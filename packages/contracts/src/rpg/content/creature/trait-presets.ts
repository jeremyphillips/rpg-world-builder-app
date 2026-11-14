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
  abduct: {
    sentence: (subject) =>
      `${capitalSubject(subject)} needn't spend extra movement to move a creature it is grappling.`,
  },
  'divine-awareness': {
    sentence: (subject) => `${capitalSubject(subject)} knows if it hears a lie.`,
  },
  inscrutable: {
    sentence: (subject) =>
      `No magic can observe ${subject} remotely or detect its thoughts without its permission. Wisdom (Insight) checks made to ascertain its intentions or sincerity are made with Disadvantage.`,
  },
  'demonic-restoration': {
    sentence: (subject) =>
      `If ${subject} dies outside the Abyss, its body dissolves into ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss.`,
  },
  'diabolical-restoration': {
    sentence: (subject) =>
      `If ${subject} dies outside the Nine Hells, its body disappears in sulfurous smoke, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells.`,
  },
  'exalted-restoration': {
    sentence: (subject) =>
      `If ${subject} dies outside Mount Celestia, its body disappears, and it gains a new body instantly, reviving with all its Hit Points somewhere in Mount Celestia.`,
  },
  'fiendish-restoration': {
    sentence: (subject) =>
      `If ${subject} dies outside the Nine Hells, its body turns to ichor, and it gains a new body instantly, reviving with all its Hit Points somewhere in the Nine Hells.`,
  },
  wishes: {
    sentence: (subject) =>
      `${capitalSubject(subject)} has a 30 percent chance of knowing the Wish spell. If it knows it, it can cast it only on behalf of a non-genie creature who communicates a wish in a way it can understand. If it casts the spell for the creature, it suffers none of the spell's stress. Once it has cast it three times, it can't do so again for 365 days.`,
  },
  compression: {
    sentence: (subject) =>
      `${capitalSubject(subject)} can move through a space as narrow as 1 inch without expending extra movement to do so.`,
  },
  'blood-frenzy': {
    sentence: (subject) =>
      `${capitalSubject(subject)} has Advantage on attack rolls against any creature that doesn't have all its Hit Points.`,
  },
  'bloodied-frenzy': {
    sentence: (subject) =>
      `While Bloodied, ${subject} has Advantage on attack rolls and saving throws.`,
  },
  'beast-of-burden': {
    sentence: (subject) =>
      `${capitalSubject(subject)} counts as one size larger for the purpose of determining its carrying capacity.`,
  },
  jumper: {
    sentence: (subject) =>
      `The jump distance of ${subject} is determined using its Dexterity rather than its Strength.`,
  },
  ephemeral: {
    sentence: (subject) => `${capitalSubject(subject)} can't wear or carry anything.`,
  },
  invisibility: {
    sentence: (subject) => `${capitalSubject(subject)} has the Invisible condition.`,
  },
  'light-sensitivity': {
    sentence: (subject) => `While in Bright Light, ${subject} has Disadvantage on attack rolls.`,
  },
  'limited-amphibiousness': {
    sentence: (subject) =>
      `${capitalSubject(subject)} can breathe air and water, but it must be submerged at least once every 4 hours to avoid suffocating outside water.`,
  },
  'blurred-form': {
    sentence: (subject) =>
      `Attack rolls against ${subject} are made with Disadvantage unless it has the Incapacitated condition.`,
  },
  reactive: {
    sentence: (subject) =>
      `${capitalSubject(subject)} can take one Reaction on every turn of combat.`,
  },
  evasion: {
    sentence: (subject) =>
      `If ${subject} is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the save and only half damage if it fails. It can't use this trait if it has the Incapacitated condition.`,
  },
  'speak-with-beasts-and-plants': {
    sentence: (subject) =>
      `${capitalSubject(subject)} can communicate with Beasts and Plants as if they shared a language.`,
  },
  freeze: {
    sentence: (subject) =>
      `If ${subject} takes Cold damage, its Speed decreases by 20 feet until the end of its next turn.`,
  },
  'fire-absorption': {
    sentence: (subject) =>
      `Whenever ${subject} is subjected to Fire damage, it regains a number of Hit Points equal to the Fire damage dealt.`,
  },
  'acid-absorption': {
    sentence: (subject) =>
      `Whenever ${subject} is subjected to Acid damage, it takes no damage and instead regains a number of Hit Points equal to the Acid damage dealt.`,
  },
  'water-form': {
    sentence: (subject) =>
      `${capitalSubject(subject)} can enter an enemy's space and stop there. It can move through a space as narrow as 1 inch without expending extra movement to do so.`,
  },
  'heat-aura': {
    sentence: (subject) =>
      `At the end of each of its turns, each creature in a 5-foot Emanation originating from ${subject} takes 16 (3d10) Fire damage.`,
  },
  'death-throes': {
    sentence: (subject) =>
      `${capitalSubject(subject)} explodes when it dies. Dexterity Saving Throw: DC 20, each creature in a 30-foot Emanation originating from ${subject}. Failure: 31 (9d6) Fire damage plus 31 (9d6) Force damage. Success: Half damage. Failure or Success: If it dies outside the Abyss, it gains a new body instantly, reviving with all its Hit Points somewhere in the Abyss.`,
  },
  'mucus-cloud': {
    sentence: (subject) =>
      `While underwater, ${subject} is surrounded by mucus. Constitution Saving Throw: DC 14, each creature in a 5-foot Emanation originating from ${subject} at the end of its turn. Failure: The target is cursed. Until the curse ends, the target's skin becomes slimy, the target can breathe air and water, and it can't regain Hit Points unless it is underwater. While the cursed creature is outside a body of water, the creature takes 6 (1d12) Acid damage at the end of every 10 minutes unless moisture is applied to its skin before those minutes have passed.`,
  },
  'aberrant-ground': {
    sentence: (subject) =>
      `The ground in a 10-foot Emanation originating from ${subject} is Difficult Terrain.`,
  },
  'aura-of-authority': {
    sentence: (subject) =>
      `While in a 10-foot Emanation originating from ${subject}, it and its allies have Advantage on attack rolls and saving throws, provided it doesn't have the Incapacitated condition.`,
  },
  'barbed-hide': {
    sentence: (subject) =>
      `At the start of each of its turns, ${subject} deals 5 (1d10) Piercing damage to any creature it is grappling or any creature grappling it.`,
  },
  'fear-aura': {
    sentence: (subject) =>
      `${capitalSubject(subject)} emanates an aura in a 20-foot Emanation while it doesn't have the Incapacitated condition. Wisdom Saving Throw: DC 21, any enemy that starts its turn in the aura. Failure: The target has the Frightened condition until the start of its next turn. Success: The target is immune to this creature's aura for 24 hours.`,
  },
  'vile-appearance': {
    sentence: (subject) =>
      `Wisdom Saving Throw: DC 11, any Beast or Humanoid that starts its turn within 30 feet of ${subject} and can see its true form. Failure: The target has the Frightened condition until the start of its next turn. Success: The target is immune to this creature's Vile Appearance for 24 hours.`,
  },
  'bloodied-fury': { sentence: () => '' },
  'ethereal-sight': { sentence: () => '' },
  mimicry: { sentence: () => '' },
  'air-form': { sentence: () => '' },
  berserk: { sentence: () => '' },
  'elemental-restoration': { sentence: () => '' },
  stench: { sentence: () => '' },
  'hold-breath': { sentence: () => '' },
  illumination: { sentence: () => '' },
  'water-breathing': { sentence: () => '' },
  'standing-leap': { sentence: () => '' },
  'legendary-resistance': { sentence: () => '' },
  regeneration: { sentence: () => '' },
  swarm: { sentence: () => '' },
} as const satisfies Record<CreatureTraitVocabularyId, CreatureTraitPreset>

export const CONFIGURABLE_CREATURE_TRAIT_PRESET_IDS = [
  'legendary-resistance',
  'hold-breath',
  'illumination',
  'standing-leap',
  'swarm',
  'regeneration',
  'water-breathing',
  'bloodied-fury',
  'ethereal-sight',
  'mimicry',
  'air-form',
  'berserk',
  'elemental-restoration',
  'stench',
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
