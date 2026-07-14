import {
  spellResolutionSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  type SpellResolution,
} from '@rpg/contracts'

import {
  applicationPatternFromForm,
  applicationPatternToForm,
} from '../application-pattern/resolution-application-pattern.lib'
import { effectToForm, effectToStored } from './resolution-effect-values'
import type { ResolutionEffectFormItem, ResolutionFormValues } from './resolution-form-schema'
import {
  applyMethodFields,
  buildMethodKind,
  buildResolutionMethod,
} from './resolution-method-values'
import { buildDefaultOutcomeFormSlots } from './resolution-outcome-slots.lib'
import { buildOutcomes, storedOutcomesToForm } from './resolution-outcome-values'
import { applyProximityFields, buildTargetProximity } from './resolution-target-values'

export const RESOLUTION_FIELD_NAME = 'resolution' as const

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
    outcomes: storedOutcomesToForm(resolution.method, resolution.outcomes),
    ...applicationPatternToForm(resolution.applicationPattern),
  }

  applyMethodFields(form, resolution.method)
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
    .filter(
      (effect): effect is NonNullable<ReturnType<typeof effectToStored>> => effect !== undefined,
    )
  if (!effects.length) return undefined

  const method = buildResolutionMethod(values)
  const proximity = buildTargetProximity(values)
  const outcomes = buildOutcomes(values)
  if (!method || !proximity || !outcomes?.length) return undefined

  const applicationPattern = applicationPatternFromForm(values)

  const candidate = {
    target: {
      count: values.targetCount,
      kind: values.targetKind,
      proximity,
    },
    method,
    ...(applicationPattern ? { applicationPattern } : {}),
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

function withDefaultOutcomes(values: ResolutionFormValues): ResolutionFormValues {
  return {
    ...values,
    outcomes: buildDefaultOutcomeFormSlots(values),
  }
}

export function createDefaultAttackResolutionFormValues(
  attackType: ResolutionFormValues['attackType'] = 'ranged-spell',
): ResolutionFormValues {
  return withDefaultOutcomes({
    targetCount: 1,
    targetKind: 'creature-or-object',
    proximityKind: attackType === 'ranged-spell' ? 'distance' : 'reach',
    ...(attackType === 'ranged-spell' ? { proximityDistanceFt: 120 } : {}),
    methodKind: 'attack',
    attackType,
    applicationPatternKind: 'none',
    effects: [defaultDamageEffect()],
  })
}

/** Default attack-preset resolution slice for unmodeled spells (Add resolution). */
export function createDefaultResolutionFormValues(): ResolutionFormValues {
  return createDefaultAttackResolutionFormValues()
}

export function createDefaultSavingThrowResolutionFormValues(): ResolutionFormValues {
  return withDefaultOutcomes({
    targetCount: 1,
    targetKind: 'creature',
    proximityKind: 'touch',
    methodKind: 'saving-throw',
    saveAbility: 'con',
    applicationPatternKind: 'none',
    effects: [
      {
        id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
        kind: 'damage',
        roll: { dice: { count: 2, faces: 10 } },
        damageType: 'necrotic',
      },
    ],
  })
}

export function createDefaultAutomaticHealingResolutionFormValues(): ResolutionFormValues {
  return withDefaultOutcomes({
    targetCount: 1,
    targetKind: 'creature',
    proximityKind: 'touch',
    methodKind: 'automatic',
    applicationPatternKind: 'none',
    effects: [
      {
        id: 'healing',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      },
    ],
  })
}
