import type { FormItem } from '@rpg/ui/form'

import { resolutionOutcomeEffectsArray } from '../../../../lib/effects/resolution-outcome-effects-array'
import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  MONSTER_SAVE_FAILED_EFFECTS_PATH,
  MONSTER_SAVE_SUCCESS_EFFECTS_PATH,
} from './monster-action-save-outcomes'

export function monsterSaveOutcomeEffectsFields(options: {
  ctx: ContentFormCtx
  namePrefix: string
  arrayName: string
  precedingEffectsPath?: string
}): FormItem[] {
  const libraryPath = options.namePrefix
    ? `${options.namePrefix}.resolution.effects`
    : 'resolution.effects'
  const listPath = options.namePrefix
    ? `${options.namePrefix}.${options.arrayName}`
    : options.arrayName
  const successPath = options.namePrefix
    ? `${options.namePrefix}.${MONSTER_SAVE_SUCCESS_EFFECTS_PATH}`
    : MONSTER_SAVE_SUCCESS_EFFECTS_PATH
  const references =
    options.arrayName === MONSTER_SAVE_FAILED_EFFECTS_PATH
      ? { role: 'owner' as const, linked: [{ path: successPath, amount: 'none' as const }] }
      : options.arrayName === MONSTER_SAVE_SUCCESS_EFFECTS_PATH
        ? { role: 'linked' as const, amounts: ['none', 'half', 'full'] as const }
        : { role: 'none' as const }

  return [
    resolutionOutcomeEffectsArray({
      ctx: options.ctx,
      name: options.arrayName,
      listPath,
      libraryPath,
      inlineKinds: ['condition', 'note'],
      references,
      precedingEffectsPath: options.precedingEffectsPath,
    }),
  ]
}
