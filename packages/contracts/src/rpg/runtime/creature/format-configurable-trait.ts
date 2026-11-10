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

/** Stat-block name and sentence for a configurable preset. Undefined when required fields are missing. */
export function formatConfigurableCreatureTrait(
  subject: string,
  trait: CreatureTraitFormatRow,
): FormattedTrait | undefined {
  switch (trait.preset) {
    case 'legendary-resistance':
      return formatLegendaryResistance(subject, trait)
    case 'hold-breath':
      return formatHoldBreath(subject, trait)
    case 'illumination':
      return formatIllumination(subject, trait)
    case 'standing-leap':
      return formatStandingLeap(subject, trait)
    case 'swarm':
      return formatSwarm(subject, trait)
    case 'regeneration':
      return formatRegeneration(subject, trait)
    case 'water-breathing':
      return formatWaterBreathing(subject, trait)
    default:
      return undefined
  }
}
