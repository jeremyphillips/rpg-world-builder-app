import { formatAtomicEffectSummary, type SpellAtomicEffect } from '@rpg/contracts'

import { normalizeSpellEffects } from './effect-form-values'
import type { EffectFormRow } from './effect-form-schema'

export const SPELL_EFFECTS_PREVIEW_LABEL = 'Effect preview' as const

/** Formats normalized spell effects for the authoring preview panel. */
export function formatSpellEffectsPreviewLines(
  effects: readonly EffectFormRow[] | undefined,
): string[] {
  return normalizeSpellEffects(effects).map((effect) => formatAtomicEffectSummary(effect))
}

/** Returns a single-line summary for an effect array item header. */
export function formatEffectRowSummary(values: Record<string, unknown>): string {
  const kind = values.kind
  if (typeof kind !== 'string') return ''

  const normalized = normalizeSpellEffects([values as EffectFormRow])
  const effect = normalized[0]
  if (!effect) return ''

  return formatAtomicEffectSummary(effect)
}

/** Returns a concise primary label for an effect array item header. */
export function formatEffectRowPrimary(
  values: Record<string, unknown>,
  index: number,
): string | undefined {
  const label = values.label
  if (typeof label === 'string' && label.trim()) return label.trim()

  const kind = values.kind
  if (typeof kind === 'string' && kind.length > 0) {
    return kind
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  return `Effect ${index + 1}`
}

export function spellEffectsToPreviewModel(
  effects: readonly EffectFormRow[] | undefined,
): SpellAtomicEffect[] {
  return normalizeSpellEffects(effects)
}
