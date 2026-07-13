import {
  formatEffectRowSentence,
  formatEffectRowTitleFromParts,
  type SpellAtomicEffectKind,
} from '@rpg/contracts'

import { normalizeSpellEffects } from './effect-form-values'
import type { EffectFormRow } from './effect-form-schema'

export const SPELL_EFFECTS_PREVIEW_LABEL = 'Effect preview' as const

/** Formats normalized spell effects for the authoring preview panel (compact lines). */
export function formatSpellEffectsPreviewLines(
  effects: readonly EffectFormRow[] | undefined,
): string[] {
  return normalizeSpellEffects(effects).map((effect) => formatEffectRowSentence(effect))
}

/** Returns a grant-style summary sentence for an effect array item header. */
export function formatEffectRowSummary(values: Record<string, unknown>): string {
  const normalized = normalizeSpellEffects([values as EffectFormRow])
  const effect = normalized[0]
  if (!effect) return ''
  return formatEffectRowSentence(effect)
}

/** Returns a grant-style primary title for an effect array item header. */
export function formatEffectRowPrimary(
  values: Record<string, unknown>,
  index: number,
): string | undefined {
  const kind = values.kind
  return formatEffectRowTitleFromParts(
    typeof kind === 'string' ? (kind as SpellAtomicEffectKind) : undefined,
    { label: values.label, unitLabel: values.unitLabel },
    index,
  )
}

export function spellEffectsToPreviewModel(
  effects: readonly EffectFormRow[] | undefined,
): ReturnType<typeof normalizeSpellEffects> {
  return normalizeSpellEffects(effects)
}
