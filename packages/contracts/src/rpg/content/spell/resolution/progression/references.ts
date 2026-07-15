import { formatRollValue, type RollValue } from '../../../../primitives/mechanics/roll'
import { formatDamageValue } from '../../effects/display'
import { effectKindPrefix } from '../../effects/display'
import { getSpellAtomicEffectKindLabel } from '../../../../vocab/spell/atomic-effect-kind'
import type {
  SpellResolutionDamageEffect,
  SpellResolutionEffect,
  SpellResolutionHealingEffect,
  SpellResolutionTemporaryHitPointsEffect,
  SpellResolutionValidationInput,
} from '../schema'
import type {
  SpellResolutionProgressionProperty,
  SpellResolutionProgressionReference,
  SpellResolutionProgressionSubject,
  SpellResolutionProgressionValue,
} from './schema'
import { isValidSpellResolutionProgressionReferencePair } from './schema'

export type ProgressionResolutionContext = Pick<
  SpellResolutionValidationInput,
  'effects' | 'applicationPattern' | 'target'
>

export type ProgressionReferenceContext = {
  reference: SpellResolutionProgressionReference
  /** Expected value kind derived from property. */
  valueKind: 'roll' | 'count'
}

const ROLL_BEARING_EFFECT_KINDS = new Set(['damage', 'healing', 'temporary-hit-points'])

export function progressionValueKindForProperty(
  property: SpellResolutionProgressionProperty,
): 'roll' | 'count' {
  return property === 'roll' ? 'roll' : 'count'
}

export function findResolutionEffectById(
  resolution: ProgressionResolutionContext,
  effectId: string,
): SpellResolutionEffect | undefined {
  return resolution.effects.find((effect) => effect.id === effectId)
}

export function isRollBearingResolutionEffect(
  effect: SpellResolutionEffect,
): effect is
  | SpellResolutionDamageEffect
  | SpellResolutionHealingEffect
  | SpellResolutionTemporaryHitPointsEffect {
  return ROLL_BEARING_EFFECT_KINDS.has(effect.kind)
}

export function readProgressionBaseRoll(
  resolution: ProgressionResolutionContext,
  reference: SpellResolutionProgressionReference,
): RollValue | undefined {
  if (reference.subject.kind !== 'effect' || reference.property !== 'roll') return undefined

  const effect = findResolutionEffectById(resolution, reference.subject.effectId)
  if (!effect || !isRollBearingResolutionEffect(effect)) return undefined
  return effect.roll
}

export function readProgressionBaseCount(
  resolution: ProgressionResolutionContext,
  reference: SpellResolutionProgressionReference,
): number | undefined {
  if (reference.property === 'projectile-count') {
    if (reference.subject.kind !== 'application-pattern') return undefined
    if (resolution.applicationPattern?.kind !== 'projectiles') return undefined
    return resolution.applicationPattern.count.value
  }

  if (reference.property === 'selected-target-count') {
    if (reference.subject.kind !== 'target') return undefined
    return resolution.target?.count
  }

  return undefined
}

export function readProgressionBaseValue(
  resolution: ProgressionResolutionContext,
  reference: SpellResolutionProgressionReference,
): SpellResolutionProgressionValue | undefined {
  const valueKind = progressionValueKindForProperty(reference.property)

  if (valueKind === 'roll') {
    const roll = readProgressionBaseRoll(resolution, reference)
    return roll === undefined ? undefined : { kind: 'roll', roll }
  }

  const count = readProgressionBaseCount(resolution, reference)
  return count === undefined ? undefined : { kind: 'count', count }
}

function buildEffectReference(
  effect: SpellResolutionEffect,
): ProgressionReferenceContext | undefined {
  if (!isRollBearingResolutionEffect(effect)) return undefined

  const reference: SpellResolutionProgressionReference = {
    subject: { kind: 'effect', effectId: effect.id },
    property: 'roll',
  }

  return { reference, valueKind: 'roll' }
}

/** Lists compatible progression references for the current resolution snapshot. */
export function listCompatibleProgressionReferences(
  resolution: ProgressionResolutionContext,
): ProgressionReferenceContext[] {
  const contexts: ProgressionReferenceContext[] = []

  for (const effect of resolution.effects) {
    const context = buildEffectReference(effect)
    if (context) contexts.push(context)
  }

  if (resolution.applicationPattern?.kind === 'projectiles') {
    contexts.push({
      reference: { subject: { kind: 'application-pattern' }, property: 'projectile-count' },
      valueKind: 'count',
    })
  }

  if (resolution.target) {
    contexts.push({
      reference: { subject: { kind: 'target' }, property: 'selected-target-count' },
      valueKind: 'count',
    })
  }

  return contexts.filter(({ reference }) =>
    isValidSpellResolutionProgressionReferencePair(reference.subject, reference.property),
  )
}

function formatEffectReferenceTitle(effect: SpellResolutionEffect): string {
  const kindLabel = getSpellAtomicEffectKindLabel(
    effect.kind === 'temporary-hit-points' ? 'temporary-hit-points' : effect.kind,
  )

  if (effect.kind === 'damage') {
    return effectKindPrefix(kindLabel, formatDamageValue(effect.roll, effect.damageType))
  }

  if (effect.kind === 'healing') {
    return effectKindPrefix(kindLabel, `${formatRollValue(effect.roll)} healing`)
  }

  if (effect.kind === 'temporary-hit-points') {
    return effectKindPrefix(kindLabel, `${formatRollValue(effect.roll)} temporary hit points`)
  }

  return kindLabel
}

/** Canonical track heading for authoring and display (layer 1). */
export function formatProgressionTrackHeading(
  resolution: ProgressionResolutionContext,
  reference: SpellResolutionProgressionReference,
): string {
  if (reference.subject.kind === 'effect' && reference.property === 'roll') {
    const effect = findResolutionEffectById(resolution, reference.subject.effectId)
    if (effect && isRollBearingResolutionEffect(effect)) {
      return formatEffectReferenceTitle(effect)
    }
    return 'Effect roll'
  }

  if (reference.property === 'projectile-count') {
    const { plural } = projectileUnitLabels(resolution)
    return effectKindPrefix('Projectile count', plural)
  }

  if (reference.property === 'selected-target-count') {
    return 'Target count'
  }

  return 'Progression'
}

export function projectileUnitLabels(resolution: ProgressionResolutionContext): {
  singular: string
  plural: string
} {
  const pattern = resolution.applicationPattern
  if (pattern?.kind === 'projectiles') {
    return {
      singular: pattern.unitLabel?.singular ?? 'projectile',
      plural: pattern.unitLabel?.plural ?? 'projectiles',
    }
  }

  return { singular: 'projectile', plural: 'projectiles' }
}

export function formatProgressionBaseValueLabel(
  resolution: ProgressionResolutionContext,
  reference: SpellResolutionProgressionReference,
): string {
  const base = readProgressionBaseValue(resolution, reference)
  if (!base) return ''

  if (base.kind === 'roll') {
    return formatProgressionRollBaseLabel(resolution, reference, base.roll)
  }

  if (reference.property === 'projectile-count') {
    const { singular, plural } = projectileUnitLabels(resolution)
    return `${base.count} ${base.count === 1 ? singular : plural}`
  }

  return String(base.count)
}

function formatProgressionRollBaseLabel(
  resolution: ProgressionResolutionContext,
  reference: SpellResolutionProgressionReference,
  roll: RollValue,
): string {
  if (reference.subject.kind === 'effect') {
    const effect = findResolutionEffectById(resolution, reference.subject.effectId)
    if (effect?.kind === 'damage') {
      return formatDamageValue(effect.roll, effect.damageType)
    }
  }

  return formatRollValue(roll)
}

export function referencesEqual(
  a: SpellResolutionProgressionReference,
  b: SpellResolutionProgressionReference,
): boolean {
  if (a.property !== b.property) return false
  if (a.subject.kind !== b.subject.kind) return false

  if (a.subject.kind === 'effect' && b.subject.kind === 'effect') {
    return a.subject.effectId === b.subject.effectId
  }

  return true
}

export function subjectLabel(subject: SpellResolutionProgressionSubject): string {
  switch (subject.kind) {
    case 'effect':
      return `effect:${subject.effectId}`
    case 'application-pattern':
      return 'application-pattern'
    case 'target':
      return 'target'
    default: {
      const _exhaustive: never = subject
      return _exhaustive
    }
  }
}
