import {
  spellResolutionSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  type SpellResolution,
  type SpellResolutionDamageEffect,
  type SpellResolutionMethod,
  type SpellResolutionRange,
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

function buildResolutionRange(values: ResolutionFormValues): SpellResolutionRange | undefined {
  switch (values.rangeKind) {
    case 'touch':
      return { kind: 'touch' }
    case 'reach':
      return values.reachDistanceFt !== undefined
        ? {
            kind: 'reach',
            distance: { value: values.reachDistanceFt, unit: 'ft' },
          }
        : { kind: 'reach' }
    case 'distance':
      if (values.rangeDistanceFt === undefined) return undefined
      return {
        kind: 'distance',
        value: { value: values.rangeDistanceFt, unit: 'ft' },
      }
    default: {
      const _exhaustive: never = values.rangeKind
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
  return (
    resolution.effects.find(
      (effect) =>
        effect.kind === 'damage' && effect.id === SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
    ) ??
    resolution.effects.find(
      (effect): effect is SpellResolutionDamageEffect => effect.kind === 'damage',
    )
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
    methodKind,
    rangeKind: resolution.range.kind,
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

  form.saveAbility = method.ability
}

function applyRangeFields(form: ResolutionFormValues, range: SpellResolutionRange): void {
  if (range.kind === 'distance') {
    form.rangeDistanceFt = range.value.value
    return
  }

  if (range.kind === 'reach' && range.distance) {
    form.reachDistanceFt = range.distance.value
  }
}

/** Maps stored resolution to flattened authoring form values. */
export function resolutionToForm(
  resolution: SpellResolution | undefined | null,
): ResolutionFormValues | undefined {
  if (!resolution) return undefined

  const form = buildBaseResolutionFormValues(resolution, findPrimaryDamageEffect(resolution))
  applyMethodFields(form, resolution.method, resolution.outcomes)
  applyRangeFields(form, resolution.range)
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
  const range = buildResolutionRange(values)
  const outcomes = buildOutcomes(values)
  if (!method || !range || !outcomes?.length) return undefined

  const candidate = {
    target: {
      count: values.targetCount,
      kind: values.targetKind,
    },
    method,
    range,
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
    methodKind: 'attack',
    attackType,
    rangeKind: attackType === 'ranged-spell' ? 'distance' : 'reach',
    ...(attackType === 'ranged-spell' ? { rangeDistanceFt: 120 } : {}),
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
    methodKind: 'saving-throw',
    saveAbility: 'con',
    rangeKind: 'touch',
    damageRoll: { dice: { count: 2, faces: 10 } },
    damageType: 'necrotic',
  }
}
