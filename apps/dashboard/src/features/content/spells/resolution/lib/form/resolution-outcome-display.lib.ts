import type { EffectRecipient } from '@rpg/contracts'

import type { ResolutionEffectFormItem } from './resolution-form-schema'

import {
  formatEffectReferenceTitle,
  resolveEffectReference,
  resolveEffectReferenceById,
} from './resolution-effect-reference.lib'
export function formatOutcomeApplicationRowLabel(
  effects: readonly ResolutionEffectFormItem[],
  application: { effectId: string },
  options?: { recipient?: EffectRecipient },
): string {
  return formatEffectReferenceTitle(
    resolveEffectReferenceById(effects, application.effectId, options),
  )
}

/** @deprecated Use `resolveEffectReference` + `formatEffectReferenceTitle`. */
export function formatResolutionOutcomeEffectMenuLabel(effect: ResolutionEffectFormItem): string {
  return formatEffectReferenceTitle(resolveEffectReference(effect))
}

/** @deprecated Use `buildAtomicEffectDisplayFromParts` via `resolveEffectReference`. */
export function formatResolutionOutcomeEffectSummary(effect: ResolutionEffectFormItem): string {
  const reference = resolveEffectReference(effect)
  if (reference.kind !== 'resolved') return ''
  return reference.display.segments.mechanicalSummary ?? ''
}

export type { ResolutionEffectFormItem }

export {
  findResolutionEffectById,
  formatEffectReferenceDescription,
  formatEffectReferenceTitle,
  resolveEffectReference,
  resolveEffectReferenceById,
  type EffectReferenceState,
} from './resolution-effect-reference.lib'
