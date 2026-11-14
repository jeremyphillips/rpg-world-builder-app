import { joinNaturalList } from '../../primitives/prose'
import {
  formatCreatureTraitDuration,
  type CreatureTraitDurationUnit,
} from '../../content/creature/trait-duration'
import { getCreatureTraitVocabularyEntry } from '../../vocab/creature/trait-vocabulary'
import { getDamageTypeLabel } from '../../vocab/damage/vocabulary'

export type CreatureTraitFormatRow = {
  preset: string
  uses?: number
  lair?: boolean
  count?: number
  unit?: CreatureTraitDurationUnit
  radius?: number
  longJump?: number
  noun?: string
  hitPoints?: number
  regeneratesAtZeroHp?: boolean
  interruptedByDamageTypes?: readonly string[]
  outsideWaterBreathAmount?: number
  outsideWaterBreathUnit?: CreatureTraitDurationUnit
  attackScope?: 'any' | 'melee'
  direction?: 'material-to-ethereal' | 'both'
  sounds?: 'animal-and-humanoid' | 'simple-heard'
  insightDc?: number
  space?: 'creature' | 'enemy'
  canBeCalmed?: boolean
  element?: 'air' | 'fire'
  dc?: number
  successImmunity?: boolean
}

type FormattedTrait = { name: string; sentence: string }

function capitalSubject(subject: string): string {
  if (!subject) return subject
  return subject.charAt(0).toUpperCase() + subject.slice(1)
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function durationUnit(value: unknown): CreatureTraitDurationUnit | undefined {
  return value === 'minute' || value === 'hour' ? value : undefined
}

function formatJumpFeet(feet: number): string {
  if (Number.isInteger(feet)) return String(feet)
  return String(Math.round(feet * 10) / 10)
}

function presetLabel(preset: string, fallback: string): string {
  return getCreatureTraitVocabularyEntry(preset)?.label ?? fallback
}

function formatLegendaryResistance(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  if (!isPositiveInt(trait.uses)) return undefined
  const lair = trait.lair === true
  const name = lair
    ? `Legendary Resistance (${trait.uses}/Day, or ${trait.uses + 1}/Day in Lair)`
    : `Legendary Resistance (${trait.uses}/Day)`
  return {
    name,
    sentence: `If ${subject} fails a saving throw, it can choose to succeed instead.`,
  }
}

function formatHoldBreath(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  const unit = durationUnit(trait.unit)
  if (!isPositiveInt(trait.count) || !unit) return undefined
  return {
    name: presetLabel(trait.preset, 'Hold Breath'),
    sentence: `${capitalSubject(subject)} can hold its breath for ${formatCreatureTraitDuration(trait.count, unit)}.`,
  }
}

function formatIllumination(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  if (!isPositiveInt(trait.radius)) return undefined
  return {
    name: presetLabel(trait.preset, 'Illumination'),
    sentence: `${capitalSubject(subject)} sheds Bright Light in a ${trait.radius}-foot radius and Dim Light for an additional ${trait.radius} feet.`,
  }
}

function formatStandingLeap(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  if (!isPositiveInt(trait.longJump)) return undefined
  const high = trait.longJump / 2
  return {
    name: presetLabel(trait.preset, 'Standing Leap'),
    sentence: `With or without a running start, ${subject} can Long Jump up to ${formatJumpFeet(trait.longJump)} feet and High Jump up to ${formatJumpFeet(high)} feet.`,
  }
}

function formatSwarm(subject: string, trait: CreatureTraitFormatRow): FormattedTrait | undefined {
  const noun = trait.noun?.trim()
  if (!noun) return undefined
  return {
    name: presetLabel(trait.preset, 'Swarm'),
    sentence: `${capitalSubject(subject)} can occupy another creature's space and vice versa, and it can move through any opening large enough for a Tiny ${noun}. It can't regain Hit Points or gain Temporary Hit Points.`,
  }
}

function interruptingDamageTypes(value: readonly string[] | undefined): string[] {
  if (!value) return []
  return value.filter((id) => id.length > 0)
}

function formatRegeneration(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  if (!isPositiveInt(trait.hitPoints)) return undefined
  const capital = capitalSubject(subject)
  const atZero = trait.regeneratesAtZeroHp === true
  const regain = atZero
    ? `${capital} regains ${trait.hitPoints} Hit Points at the start of each of its turns.`
    : `${capital} regains ${trait.hitPoints} Hit Points at the start of each of its turns if it has at least 1 Hit Point.`
  const damageTypes = interruptingDamageTypes(trait.interruptedByDamageTypes)
  const interruption =
    damageTypes.length > 0
      ? `If ${subject} takes ${joinNaturalList(
          damageTypes.map((id) => getDamageTypeLabel(id)),
          { conjunction: 'or' },
        )} damage, this trait doesn't function on ${subject}'s next turn.`
      : ''
  const death = atZero
    ? `${capital} dies only if it starts its turn with 0 Hit Points and doesn't regenerate.`
    : ''
  return {
    name: presetLabel(trait.preset, 'Regeneration'),
    sentence: [regain, interruption, death].filter((clause) => clause.length > 0).join(' '),
  }
}

function formatBloodiedFury(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  if (trait.attackScope !== 'any' && trait.attackScope !== 'melee') return undefined
  const rolls = trait.attackScope === 'melee' ? 'melee attack rolls' : 'attack rolls'
  return {
    name: presetLabel(trait.preset, 'Bloodied Fury'),
    sentence: `While Bloodied, ${subject} has Advantage on ${rolls}.`,
  }
}

function formatEtherealSight(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  if (trait.direction !== 'material-to-ethereal' && trait.direction !== 'both') return undefined
  const sentence =
    trait.direction === 'both'
      ? `${capitalSubject(subject)} can see 60 feet into the Ethereal Plane while on the Material Plane and vice versa.`
      : `${capitalSubject(subject)} can see 60 feet into the Ethereal Plane when it is on the Material Plane.`
  return { name: presetLabel(trait.preset, 'Ethereal Sight'), sentence }
}

function formatMimicry(subject: string, trait: CreatureTraitFormatRow): FormattedTrait | undefined {
  if (!isPositiveInt(trait.insightDc) || trait.insightDc > 30) return undefined
  const capital = capitalSubject(subject)
  if (trait.sounds === 'animal-and-humanoid') {
    return {
      name: presetLabel(trait.preset, 'Mimicry'),
      sentence: `${capital} can mimic animal sounds and humanoid voices. A creature that hears the sounds can tell they are imitations only with a successful DC ${trait.insightDc} Wisdom (Insight) check.`,
    }
  }
  if (trait.sounds === 'simple-heard') {
    return {
      name: presetLabel(trait.preset, 'Mimicry'),
      sentence: `${capital} can mimic simple sounds it has heard, such as a whisper or chitter. A hearer can discern the sounds are imitations with a successful DC ${trait.insightDc} Wisdom (Insight) check.`,
    }
  }
  return undefined
}

function formatAirForm(subject: string, trait: CreatureTraitFormatRow): FormattedTrait | undefined {
  if (trait.space !== 'creature' && trait.space !== 'enemy') return undefined
  const space = trait.space === 'enemy' ? "an enemy's space" : "a creature's space"
  return {
    name: presetLabel(trait.preset, 'Air Form'),
    sentence: `${capitalSubject(subject)} can enter ${space} and stop there. It can move through a space as narrow as 1 inch without expending extra movement to do so.`,
  }
}

function formatBerserk(subject: string, trait: CreatureTraitFormatRow): FormattedTrait {
  const opening = `Whenever ${subject} starts its turn Bloodied, roll 1d6. On a 6, it goes berserk. On each of its turns while berserk, it attacks the nearest creature it can see. If no creature is near enough to move to and attack, it attacks an object.`
  const ending =
    trait.canBeCalmed === true
      ? 'Once it goes berserk, it remains so until it is destroyed or it is no longer Bloodied. Its creator, if within 60 feet of it, can try to calm it by taking an action to make a DC 15 Charisma (Persuasion) check; it must be able to hear its creator. If this check succeeds, it ceases being berserk until the start of its next turn, at which point it resumes rolling for the Berserk trait again if it is still Bloodied.'
      : 'Once it goes berserk, it continues to be berserk until it is destroyed or it is no longer Bloodied.'
  return {
    name: presetLabel(trait.preset, 'Berserk'),
    sentence: `${opening} ${ending}`,
  }
}

function formatElementalRestoration(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  if (trait.element === 'air') {
    return {
      name: presetLabel(trait.preset, 'Elemental Restoration'),
      sentence: `If ${subject} dies outside the Elemental Plane of Air, its body dissolves into mist, and it gains a new body in 1d4 days, reviving with all its Hit Points somewhere on the Plane of Air.`,
    }
  }
  if (trait.element === 'fire') {
    return {
      name: presetLabel(trait.preset, 'Elemental Restoration'),
      sentence: `If ${subject} dies outside the Elemental Plane of Fire, its body dissolves into ash, and it gains a new body in 1d4 days, reviving with all its Hit Points somewhere on the Plane of Fire.`,
    }
  }
  return undefined
}

function formatStench(subject: string, trait: CreatureTraitFormatRow): FormattedTrait | undefined {
  if (!isPositiveInt(trait.dc) || trait.dc > 30 || !isPositiveInt(trait.radius)) return undefined
  const immunity =
    trait.successImmunity === true
      ? " Success: The target is immune to this creature's Stench for 24 hours."
      : ''
  return {
    name: presetLabel(trait.preset, 'Stench'),
    sentence: `Constitution Saving Throw: DC ${trait.dc}, any creature that starts its turn in a ${trait.radius}-foot Emanation originating from ${subject}. Failure: The target has the Poisoned condition until the start of its next turn.${immunity}`,
  }
}

function formatWaterBreathing(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  const unit = durationUnit(trait.outsideWaterBreathUnit)
  const amount = trait.outsideWaterBreathAmount
  const outside =
    isPositiveInt(amount) && unit
      ? ` It can hold its breath for ${formatCreatureTraitDuration(amount, unit)} outside water.`
      : ''
  return {
    name: presetLabel(trait.preset, 'Water Breathing'),
    sentence: `${capitalSubject(subject)} can breathe only underwater.${outside}`,
  }
}

const CONFIGURABLE_TRAIT_FORMATTERS: Record<
  string,
  (subject: string, trait: CreatureTraitFormatRow) => FormattedTrait | undefined
> = {
  'legendary-resistance': formatLegendaryResistance,
  'hold-breath': formatHoldBreath,
  illumination: formatIllumination,
  'standing-leap': formatStandingLeap,
  swarm: formatSwarm,
  regeneration: formatRegeneration,
  'water-breathing': formatWaterBreathing,
  'bloodied-fury': formatBloodiedFury,
  'ethereal-sight': formatEtherealSight,
  mimicry: formatMimicry,
  'air-form': formatAirForm,
  berserk: formatBerserk,
  'elemental-restoration': formatElementalRestoration,
  stench: formatStench,
}

/** Stat-block name and sentence for a configurable preset. Undefined when required fields are missing. */
export function formatConfigurableCreatureTrait(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  return CONFIGURABLE_TRAIT_FORMATTERS[trait.preset]?.(subject, trait)
}
