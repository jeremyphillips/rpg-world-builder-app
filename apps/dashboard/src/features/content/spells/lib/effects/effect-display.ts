import {
  buildAtomicEffectDisplayFromParts,
  formatAtomicEffectDisplayTitle,
  formatEffectRowSentence,
  type EffectRecipient,
  type SpellAtomicEffectKind,
  type SpellResolutionTargetKind,
} from '@rpg/contracts'

import {
  normalizeRollFormValue,
  type RollFormShape,
} from '../../../lib/forms/mechanics/roll-form-values'
import { normalizeSpellEffects } from './effect-form-values'
import type { EffectFormRow } from './effect-form-schema'

export const SPELL_EFFECTS_PREVIEW_LABEL = 'Effect preview' as const

type EffectRowDisplayOptions = {
  recipient?: EffectRecipient
  targetKind?: SpellResolutionTargetKind
  fallbackIndex?: number
}

function buildDisplayFromFormRow(
  values: Record<string, unknown>,
  options?: EffectRowDisplayOptions,
) {
  const kind = typeof values.kind === 'string' ? (values.kind as SpellAtomicEffectKind) : undefined
  const roll = normalizeRollFormValue(values.roll as RollFormShape) ?? undefined

  return buildAtomicEffectDisplayFromParts(
    {
      kind,
      label: typeof values.label === 'string' ? values.label : undefined,
      unitLabel: typeof values.unitLabel === 'string' ? values.unitLabel : undefined,
      roll,
      damageType: typeof values.damageType === 'string' ? values.damageType : undefined,
      count: typeof values.count === 'number' ? values.count : undefined,
    },
    options,
  )
}

/** Formats normalized spell effects for the authoring preview panel (compact lines). */
export function formatSpellEffectsPreviewLines(
  effects: readonly EffectFormRow[] | undefined,
): string[] {
  return normalizeSpellEffects(effects).map((effect) => formatEffectRowSentence(effect))
}

/** Returns a recipient-aware summary sentence for an effect array item header. */
export function formatEffectRowSummary(
  values: Record<string, unknown>,
  options?: Pick<EffectRowDisplayOptions, 'recipient' | 'targetKind'>,
): string {
  return buildDisplayFromFormRow(values, options).summary ?? ''
}

/** Returns a compact mechanical title for an effect array item header. */
export function formatEffectRowPrimary(
  values: Record<string, unknown>,
  index: number,
  options?: Pick<EffectRowDisplayOptions, 'recipient' | 'targetKind'>,
): string {
  return formatAtomicEffectDisplayTitle(
    buildDisplayFromFormRow(values, { ...options, fallbackIndex: index }),
  )
}

export function spellEffectsToPreviewModel(
  effects: readonly EffectFormRow[] | undefined,
): ReturnType<typeof normalizeSpellEffects> {
  return normalizeSpellEffects(effects)
}
