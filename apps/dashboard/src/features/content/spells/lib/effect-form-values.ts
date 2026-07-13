import { spellAtomicEffectSchema, type SpellAtomicEffect } from '@rpg/contracts'

import { normalizeRollFormValue, rollToFormShape } from '../../lib/forms/mechanics/roll-form-values'
import type { EffectFormRow } from './effect-form-schema'

function parseSpellEffect(payload: Record<string, unknown>): SpellAtomicEffect | undefined {
  const parsed = spellAtomicEffectSchema.safeParse(payload)
  return parsed.success ? parsed.data : undefined
}

function stripEffectFieldsForKind(
  row: EffectFormRow,
): Omit<EffectFormRow, 'roll' | 'damageType' | 'count'> &
  Partial<Pick<EffectFormRow, 'roll' | 'damageType' | 'count'>> {
  const base = {
    id: row.id,
    kind: row.kind,
    ...(row.label?.trim() ? { label: row.label.trim() } : {}),
    ...(row.description?.trim() ? { description: row.description } : {}),
  }

  switch (row.kind) {
    case 'damage':
      return {
        ...base,
        roll: row.roll,
        damageType: row.damageType,
      }
    case 'healing':
    case 'temporary-hit-points':
      return {
        ...base,
        roll: row.roll,
      }
    case 'projectile-count':
      return {
        ...base,
        count: row.count,
      }
    default: {
      const _exhaustive: never = row.kind
      return _exhaustive
    }
  }
}

function normalizeRollBearingEffect(
  stripped: ReturnType<typeof stripEffectFieldsForKind>,
): SpellAtomicEffect | undefined {
  const roll = normalizeRollFormValue(stripped.roll)
  if (!roll) return undefined
  return parseSpellEffect({ ...stripped, roll })
}

function normalizeDamageEffect(
  stripped: ReturnType<typeof stripEffectFieldsForKind>,
): SpellAtomicEffect | undefined {
  const roll = normalizeRollFormValue(stripped.roll)
  if (!roll || !stripped.damageType) return undefined
  return parseSpellEffect({ ...stripped, roll })
}

function normalizeEffectRow(row: EffectFormRow): SpellAtomicEffect | undefined {
  const stripped = stripEffectFieldsForKind(row)

  switch (stripped.kind) {
    case 'damage':
      return normalizeDamageEffect(stripped)
    case 'healing':
    case 'temporary-hit-points':
      return normalizeRollBearingEffect(stripped)
    case 'projectile-count':
      if (stripped.count === undefined) return undefined
      return parseSpellEffect(stripped)
    default: {
      const _exhaustive: never = stripped.kind
      return _exhaustive
    }
  }
}

/** Normalizes in-progress effect rows to contract-shaped atomic effects. */
export function normalizeSpellEffects(
  effects: readonly EffectFormRow[] | undefined,
): SpellAtomicEffect[] {
  if (!effects?.length) return []
  return effects.flatMap((row) => {
    const normalized = normalizeEffectRow(row)
    return normalized ? [normalized] : []
  })
}

export function spellEffectsToFormValues(
  effects: readonly SpellAtomicEffect[] | undefined,
): EffectFormRow[] {
  return (effects ?? []).map((effect) => {
    if (!('roll' in effect) || effect.roll === undefined) {
      return { ...effect } as EffectFormRow
    }

    return {
      ...effect,
      roll: rollToFormShape(effect.roll),
    } as EffectFormRow
  })
}

export function spellEffectsFromFormValues(
  effects: readonly EffectFormRow[] | undefined,
): SpellAtomicEffect[] | undefined {
  const normalized = normalizeSpellEffects(effects)
  return normalized.length > 0 ? normalized : undefined
}
