import type { EffectRecipient } from '@rpg/contracts'

import type { ResolutionEffectFormItem } from './resolution-form-schema'

import {
  formatEffectReferenceTitle,
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

export type { ResolutionEffectFormItem }

export {
  findResolutionEffectById,
  formatEffectReferenceDescription,
  formatEffectReferenceTitle,
  resolveEffectReference,
  resolveEffectReferenceById,
  type EffectReferenceState,
} from './resolution-effect-reference.lib'
