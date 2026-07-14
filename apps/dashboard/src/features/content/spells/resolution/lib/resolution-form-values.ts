import {
  spellResolutionEffectIdSchema,
  spellResolutionSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  type SpellResolution,
  type SpellResolutionEffect,
  type SpellResolutionEffectId,
  type SpellResolutionMethod,
  type SpellResolutionTargetProximity,
} from '@rpg/contracts'

import {
  normalizeRollFormValue,
  rollToFormShape,
  type RollFormShape,
} from '../../../lib/forms/mechanics/roll-form-values'
import type {
  ResolutionEffectFormItem,
  ResolutionFormValues,
  ResolutionMethodKind,
  ResolutionOutcomeFormItem,
} from './resolution-form-schema'

export const RESOLUTION_FIELD_NAME = 'resolution' as const

const PRIMARY_RESOLUTION_EFFECT_KINDS = ['damage', 'healing', 'temporary-hit-points'] as const

type PrimaryResolutionEffectKind = (typeof PRIMARY_RESOLUTION_EFFECT_KINDS)[number]

function buildResolutionMethod(values: ResolutionFormValues): SpellResolutionMethod | undefined {
  if (values.methodKind === 'automatic') {
    return { kind: 'automatic' }
  }

  if (values.methodKind === 'attack') {
    if (!values.attackType) return undefined
    return { kind: 'attack', attackType: values.attackType }
  }

  if (!values.saveAbility) return undefined
  return { kind: 'saving-throw', ability: values.saveAbility }
}

function buildTargetProximity(
  values: ResolutionFormValues,
): SpellResolutionTargetProximity | undefined {
  switch (values.proximityKind) {
    case 'touch':
      return { kind: 'touch' }
    case 'reach':
      return values.proximityReachDistanceFt !== undefined
        ? {
            kind: 'reach',
            distance: { value: values.proximityReachDistanceFt, unit: 'ft' },
          }
        : { kind: 'reach' }
    case 'distance':
      if (values.proximityDistanceFt === undefined) return undefined
      return {
        kind: 'distance',
        distance: { value: values.proximityDistanceFt, unit: 'ft' },
      }
    case 'self':
      return { kind: 'self' }
    default: {
      const _exhaustive: never = values.proximityKind
      return _exhaustive
    }
  }
}

function findPrimaryEffectId(
  effects: readonly ResolutionEffectFormItem[],
): SpellResolutionEffectId | undefined {
  const primary = effects.find((effect) =>
    PRIMARY_RESOLUTION_EFFECT_KINDS.includes(effect.kind as PrimaryResolutionEffectKind),
  )
  return primary ? parseEffectId(primary.id) : undefined
}

function parseEffectId(id: string): SpellResolutionEffectId {
  return spellResolutionEffectIdSchema.parse(id)
}

function buildAttackOutcomes(
  effectId: SpellResolutionEffectId,
  hitNote: string | undefined,
): SpellResolution['outcomes'] {
  return [
    {
      result: 'hit',
      applications: [{ effectId, amount: 'full' }],
      ...(hitNote ? { note: hitNote } : {}),
    },
  ]
}

function buildSavingThrowOutcomes(effectId: SpellResolutionEffectId): SpellResolution['outcomes'] {
  return [
    {
      result: 'failed-save',
      applications: [{ effectId, amount: 'full' }],
    },
    {
      result: 'successful-save',
      applications: [{ effectId, amount: 'half' }],
    },
  ]
}

function buildAutomaticOutcomes(effectId: SpellResolutionEffectId): SpellResolution['outcomes'] {
  return [
    {
      result: 'applied',
      applications: [{ effectId, amount: 'full' }],
    },
  ]
}

function synthesizeOutcomes(values: ResolutionFormValues): SpellResolution['outcomes'] | undefined {
  const primaryEffectId = findPrimaryEffectId(values.effects)
  if (!primaryEffectId) return undefined

  if (values.methodKind === 'attack') {
    const note = values.hitNote?.trim()
    return buildAttackOutcomes(primaryEffectId, note || undefined)
  }

  if (values.methodKind === 'saving-throw') {
    return buildSavingThrowOutcomes(primaryEffectId)
  }

  return buildAutomaticOutcomes(primaryEffectId)
}

function storedOutcomesToForm(outcomes: SpellResolution['outcomes']): ResolutionOutcomeFormItem[] {
  return outcomes.map((outcome) => ({
    result: outcome.result,
    ...(outcome.note ? { note: outcome.note } : {}),
    applications: outcome.applications.map((application) => ({
      effectId: application.effectId,
      amount: application.amount,
    })),
  }))
}

function formOutcomesToStored(
  outcomes: ResolutionOutcomeFormItem[] | undefined,
): SpellResolution['outcomes'] | undefined {
  if (!outcomes?.length) return undefined

  return outcomes.map((outcome) => ({
    result: outcome.result,
    ...(outcome.note?.trim() ? { note: outcome.note.trim() } : {}),
    applications: outcome.applications.map((application) => ({
      effectId: parseEffectId(application.effectId),
      amount: application.amount,
    })),
  }))
}

function buildOutcomes(values: ResolutionFormValues): SpellResolution['outcomes'] | undefined {
  return formOutcomesToStored(values.outcomes) ?? synthesizeOutcomes(values)
}

function effectToForm(effect: SpellResolutionEffect): ResolutionEffectFormItem {
  const roll = rollToFormShape(effect.roll) ?? {}

  switch (effect.kind) {
    case 'damage':
      return {
        id: effect.id,
        kind: 'damage',
        roll,
        damageType: effect.damageType,
      }
    case 'healing':
      return {
        id: effect.id,
        kind: 'healing',
        roll,
      }
    case 'temporary-hit-points':
      return {
        id: effect.id,
        kind: 'temporary-hit-points',
        roll,
      }
    default: {
      const _exhaustive: never = effect
      return _exhaustive
    }
  }
}

function effectToStored(effect: ResolutionEffectFormItem): SpellResolutionEffect | undefined {
  const roll = normalizeRollFormValue(effect.roll as RollFormShape)
  if (!roll) return undefined

  switch (effect.kind) {
    case 'damage':
      if (!effect.damageType) return undefined
      return {
        id: parseEffectId(effect.id),
        kind: 'damage',
        roll,
        damageType: effect.damageType,
      }
    case 'healing':
      return {
        id: parseEffectId(effect.id),
        kind: 'healing',
        roll,
      }
    case 'temporary-hit-points':
      return {
        id: parseEffectId(effect.id),
        kind: 'temporary-hit-points',
        roll,
      }
    default: {
      const _exhaustive: never = effect
      return _exhaustive
    }
  }
}

function buildMethodKind(method: SpellResolutionMethod): ResolutionMethodKind {
  if (method.kind === 'automatic') return 'automatic'
  if (method.kind === 'attack') return 'attack'
  return 'saving-throw'
}

function applyMethodFields(
  form: ResolutionFormValues,
  method: SpellResolutionMethod,
  outcomes: SpellResolution['outcomes'],
): void {
  if (method.kind === 'attack') {
    form.attackType = method.attackType
    const hitNote = outcomes.find((outcome) => outcome.result === 'hit')?.note
    if (hitNote) form.hitNote = hitNote
    return
  }

  if (method.kind === 'saving-throw') {
    form.saveAbility = method.ability
  }
}

function applyProximityFields(
  form: ResolutionFormValues,
  proximity: SpellResolutionTargetProximity,
): void {
  if (proximity.kind === 'distance') {
    form.proximityDistanceFt = proximity.distance.value
    return
  }

  if (proximity.kind === 'reach' && proximity.distance) {
    form.proximityReachDistanceFt = proximity.distance.value
  }
}

/** Maps stored resolution to flattened authoring form values. */
export function resolutionToForm(
  resolution: SpellResolution | undefined | null,
): ResolutionFormValues | undefined {
  if (!resolution) return undefined
  if (!resolution.effects.length) return undefined

  const form: ResolutionFormValues = {
    targetCount: resolution.target.count,
    targetKind: resolution.target.kind,
    proximityKind: resolution.target.proximity.kind,
    methodKind: buildMethodKind(resolution.method),
    effects: resolution.effects.map(effectToForm),
    outcomes: storedOutcomesToForm(resolution.outcomes),
  }

  applyMethodFields(form, resolution.method, resolution.outcomes)
  applyProximityFields(form, resolution.target.proximity)
  return form
}

/** Normalizes flattened form values to a contract resolution envelope. */
export function resolutionToStored(
  values: ResolutionFormValues | undefined,
): SpellResolution | undefined {
  if (!values) return undefined

  const effects = values.effects
    .map(effectToStored)
    .filter((effect): effect is SpellResolutionEffect => effect !== undefined)
  if (!effects.length) return undefined

  const method = buildResolutionMethod(values)
  const proximity = buildTargetProximity(values)
  const outcomes = buildOutcomes(values)
  if (!method || !proximity || !outcomes?.length) return undefined

  const candidate = {
    target: {
      count: values.targetCount,
      kind: values.targetKind,
      proximity,
    },
    method,
    effects,
    outcomes,
  }

  const parsed = spellResolutionSchema.safeParse(candidate)
  return parsed.success ? parsed.data : undefined
}

/** Alias aligned with effect-form-values naming. */
export function spellResolutionFromFormValues(
  values: ResolutionFormValues | undefined,
): SpellResolution | undefined {
  return resolutionToStored(values)
}

function defaultDamageEffect(): ResolutionEffectFormItem {
  return {
    id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
    kind: 'damage',
    roll: { dice: { count: 1, faces: 10 } },
    damageType: 'force',
  }
}

export function createDefaultAttackResolutionFormValues(
  attackType: ResolutionFormValues['attackType'] = 'ranged-spell',
): ResolutionFormValues {
  return {
    targetCount: 1,
    targetKind: 'creature-or-object',
    proximityKind: attackType === 'ranged-spell' ? 'distance' : 'reach',
    ...(attackType === 'ranged-spell' ? { proximityDistanceFt: 120 } : {}),
    methodKind: 'attack',
    attackType,
    effects: [defaultDamageEffect()],
  }
}

/** Default attack-preset resolution slice for unmodeled spells (Add resolution). */
export function createDefaultResolutionFormValues(): ResolutionFormValues {
  return createDefaultAttackResolutionFormValues()
}

export function createDefaultSavingThrowResolutionFormValues(): ResolutionFormValues {
  return {
    targetCount: 1,
    targetKind: 'creature',
    proximityKind: 'touch',
    methodKind: 'saving-throw',
    saveAbility: 'con',
    effects: [
      {
        id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
        kind: 'damage',
        roll: { dice: { count: 2, faces: 10 } },
        damageType: 'necrotic',
      },
    ],
  }
}

export function createDefaultAutomaticHealingResolutionFormValues(): ResolutionFormValues {
  return {
    targetCount: 1,
    targetKind: 'creature',
    proximityKind: 'touch',
    methodKind: 'automatic',
    effects: [
      {
        id: 'healing',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      },
    ],
  }
}
