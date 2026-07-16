import type { SpellResolution, SpellResolutionEffectId } from '@rpg/contracts'

import { findPrimaryEffectId } from './resolution-effect-values'
import type { ResolutionFormValues, ResolutionOutcomeFormItem } from './resolution-form-schema'
import { parseEffectId } from './resolution-effect-values'

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

export function buildOutcomes(
  values: ResolutionFormValues,
): SpellResolution['outcomes'] | undefined {
  return formOutcomesToStored(values.outcomes) ?? synthesizeOutcomes(values)
}

export { storedOutcomesToForm }
