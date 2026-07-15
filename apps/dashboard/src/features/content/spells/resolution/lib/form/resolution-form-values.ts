import {
  spellResolutionSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  type Spell,
  type SpellResolution,
} from '@rpg/contracts'

import { applicationPatternFromForm } from '../application-pattern/resolution-application-pattern.lib'
import { EMPTY_RESOLUTION_AREA_OF_EFFECT, resolutionAreaFromForm } from './resolution-area-values'
import { effectToStored } from './resolution-effect-values'
import type { ResolutionEffectFormItem, ResolutionFormValues } from './resolution-form-schema'
import {
  applyResolutionFormDerivedFields,
  buildResolutionFormMechanicsFields,
  buildResolutionFormSelectionFields,
} from './resolution-form-to-form.lib'
import { buildResolutionMethod } from './resolution-method-values'
import { buildDefaultOutcomeFormSlots } from './resolution-outcome-slots.lib'
import { buildOutcomes } from './resolution-outcome-values'
import { progressionFromForm, progressionToForm } from './resolution-progression-values'
import { buildTargetProximity } from './resolution-target-values'

export const RESOLUTION_FIELD_NAME = 'resolution' as const

/** Maps stored resolution to flattened authoring form values. */
export function resolutionToForm(
  resolution: SpellResolution | undefined | null,
): ResolutionFormValues | undefined {
  if (!resolution) return undefined
  if (!resolution.effects.length) return undefined

  const form: ResolutionFormValues = {
    ...buildResolutionFormSelectionFields(resolution),
    ...buildResolutionFormMechanicsFields(resolution),
    ...progressionToForm(resolution.progression),
  }

  return applyResolutionFormDerivedFields(form, resolution)
}

function buildSelectionEnvelope(
  values: ResolutionFormValues,
): Pick<SpellResolution, 'selectionMode' | 'target' | 'origin' | 'areaOfEffect'> | undefined {
  const areaOfEffect = resolutionAreaFromForm(values.areaOfEffect)

  switch (values.selectionMode) {
    case 'self':
      return {
        selectionMode: 'self',
        ...(areaOfEffect ? { areaOfEffect } : {}),
      }
    case 'point': {
      if (values.originDistanceFt === undefined) return undefined
      return {
        selectionMode: 'point',
        origin: {
          proximity: {
            kind: 'distance',
            distance: { value: values.originDistanceFt, unit: 'ft' },
          },
        },
        ...(areaOfEffect ? { areaOfEffect } : {}),
      }
    }
    case 'none':
      return { selectionMode: 'none' }
    case 'targets': {
      const proximity = buildTargetProximity(values)
      if (!proximity) return undefined
      return {
        selectionMode: 'targets',
        target: {
          count: values.targetCount,
          ...(values.targetCount !== 1 && values.countKind ? { countKind: values.countKind } : {}),
          kind: values.targetKind,
          proximity,
        },
      }
    }
    default: {
      const _exhaustive: never = values.selectionMode
      return _exhaustive
    }
  }
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
  const outcomes = buildOutcomes(values)
  if (!method || !outcomes?.length) return undefined

  const applicationPattern = applicationPatternFromForm(values)
  const progression = progressionFromForm(values.progressionBasis, values.progressionTracks)
  const selectionEnvelope = buildSelectionEnvelope(values)
  if (!selectionEnvelope) return undefined

  const candidate = {
    ...selectionEnvelope,
    method,
    ...(applicationPattern ? { applicationPattern } : {}),
    ...(progression ? { progression } : {}),
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

/** Reads spell range distance for first-time point-mode origin initialization. */
export function initializeOriginFromSpellRange(
  spell: Pick<Spell, 'range'> | undefined,
): number | undefined {
  if (!spell || spell.range.kind !== 'distance') return undefined
  return spell.range.value.value
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
    selectionMode: 'targets',
    targetCount: 1,
    countKind: 'exact',
    targetKind: 'creature-or-object',
    proximityKind: attackType === 'ranged-spell' ? 'distance' : 'reach',
    ...(attackType === 'ranged-spell' ? { proximityDistanceFt: 120 } : {}),
    areaOfEffect: { ...EMPTY_RESOLUTION_AREA_OF_EFFECT },
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
    selectionMode: 'targets',
    targetCount: 1,
    countKind: 'exact',
    targetKind: 'creature',
    proximityKind: 'touch',
    areaOfEffect: { ...EMPTY_RESOLUTION_AREA_OF_EFFECT },
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
    selectionMode: 'targets',
    targetCount: 1,
    countKind: 'exact',
    targetKind: 'creature',
    proximityKind: 'touch',
    areaOfEffect: { ...EMPTY_RESOLUTION_AREA_OF_EFFECT },
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
