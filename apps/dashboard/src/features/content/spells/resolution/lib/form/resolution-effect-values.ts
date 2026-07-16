import {
  spellResolutionEffectIdSchema,
  type SpellResolutionEffect,
  type SpellResolutionEffectId,
} from '@rpg/contracts'

import {
  normalizeRollFormValue,
  rollToFormShape,
  type RollFormShape,
} from '../../../../lib/forms/mechanics/roll-form-values'
import type { ResolutionEffectFormItem } from './resolution-form-schema'

const PRIMARY_RESOLUTION_EFFECT_KINDS = ['damage', 'healing', 'temporary-hit-points'] as const

type PrimaryResolutionEffectKind = (typeof PRIMARY_RESOLUTION_EFFECT_KINDS)[number]

export function parseEffectId(id: string): SpellResolutionEffectId {
  return spellResolutionEffectIdSchema.parse(id)
}

export function findPrimaryEffectId(
  effects: readonly ResolutionEffectFormItem[],
): SpellResolutionEffectId | undefined {
  const primary = effects.find((effect) =>
    PRIMARY_RESOLUTION_EFFECT_KINDS.includes(effect.kind as PrimaryResolutionEffectKind),
  )
  return primary ? parseEffectId(primary.id) : undefined
}

export function effectToForm(effect: SpellResolutionEffect): ResolutionEffectFormItem {
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

export function effectToStored(
  effect: ResolutionEffectFormItem,
): SpellResolutionEffect | undefined {
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
