import {
  spellResolutionSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  type SpellResolution,
  type SpellResolutionDamageEffect,
  type SpellResolutionMethod,
  type SpellResolutionTargetProximity,
} from '@rpg/contracts'

import {
  normalizeRollFormValue,
  rollToFormShape,
  type RollFormShape,
} from '../../../lib/forms/mechanics/roll-form-values'
import type { ResolutionFormValues, ResolutionMethodKind } from './resolution-form-schema'

export const RESOLUTION_FIELD_NAME = 'resolution' as const

function buildResolutionMethod(values: ResolutionFormValues): SpellResolutionMethod | undefined {
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

function buildAttackOutcomes(hitNote: string | undefined): SpellResolution['outcomes'] | undefined {
  return [
    {
      result: 'hit',
      applications: [
        {
          effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
          amount: 'full',
        },
      ],
      ...(hitNote ? { note: hitNote } : {}),
    },
  ]
}

function buildSavingThrowDamageOutcomes(): SpellResolution['outcomes'] {
  return [
    {
      result: 'failed-save',
      applications: [
        {
          effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
          amount: 'full',
        },
      ],
    },
    {
      result: 'successful-save',
      applications: [
        {
          effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
          amount: 'half',
        },
      ],
    },
  ]
}

function buildOutcomes(values: ResolutionFormValues): SpellResolution['outcomes'] | undefined {
  if (values.methodKind === 'attack') {
    const note = values.hitNote?.trim()
    return buildAttackOutcomes(note || undefined)
  }

  return buildSavingThrowDamageOutcomes()
}

function findPrimaryDamageEffect(
  resolution: SpellResolution,
): SpellResolutionDamageEffect | undefined {
  return resolution.effects.find(
    (effect): effect is SpellResolutionDamageEffect => effect.kind === 'damage',
  )
}

function buildBaseResolutionFormValues(
  resolution: SpellResolution,
  damageEffect: SpellResolutionDamageEffect | undefined,
): ResolutionFormValues {
  const methodKind: ResolutionMethodKind =
    resolution.method.kind === 'attack' ? 'attack' : 'saving-throw'

  return {
    targetCount: resolution.target.count,
    targetKind: resolution.target.kind,
    proximityKind: resolution.target.proximity.kind,
    methodKind,
    damageRoll: (damageEffect ? rollToFormShape(damageEffect.roll) : undefined) ?? {},
    ...(damageEffect ? { damageType: damageEffect.damageType } : {}),
  }
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
  if (resolution.method.kind === 'automatic') return undefined

  const damageEffect = findPrimaryDamageEffect(resolution)
  if (!damageEffect) return undefined

  const form = buildBaseResolutionFormValues(resolution, damageEffect)
  applyMethodFields(form, resolution.method, resolution.outcomes)
  applyProximityFields(form, resolution.target.proximity)
  return form
}

/** Normalizes flattened form values to a contract resolution envelope. */
export function resolutionToStored(
  values: ResolutionFormValues | undefined,
): SpellResolution | undefined {
  if (!values) return undefined

  const roll = normalizeRollFormValue(values.damageRoll as RollFormShape)
  if (!roll || !values.damageType) return undefined

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
    effects: [
      {
        id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
        kind: 'damage' as const,
        roll,
        damageType: values.damageType,
      },
    ],
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
    damageRoll: { dice: { count: 1, faces: 10 } },
    damageType: 'force',
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
    damageRoll: { dice: { count: 2, faces: 10 } },
    damageType: 'necrotic',
  }
}
