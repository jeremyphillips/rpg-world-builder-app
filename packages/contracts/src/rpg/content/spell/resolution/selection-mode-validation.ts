import type { z } from 'zod'

import { spellResolutionValidationMessages } from './validation-messages'
import type { SpellResolutionSelectionMode } from './vocab'

type ResolutionModeField = 'target' | 'origin' | 'areaOfEffect'

export type SpellResolutionModeValidationInput = {
  selectionMode: SpellResolutionSelectionMode
  target?: unknown
  origin?: unknown
  areaOfEffect?: unknown
}

type ModeFieldRule = {
  field: ResolutionModeField
  message: (mode: SpellResolutionSelectionMode) => string
}

const MODE_FIELD_RULES: Record<
  SpellResolutionSelectionMode,
  { required?: ModeFieldRule[]; forbidden?: ModeFieldRule[] }
> = {
  targets: {
    required: [
      {
        field: 'target',
        message: () => spellResolutionValidationMessages.targetRequiredForTargetsMode(),
      },
    ],
    forbidden: [
      {
        field: 'origin',
        message: (mode) => spellResolutionValidationMessages.originForbiddenForMode({ mode }),
      },
      {
        field: 'areaOfEffect',
        message: (mode) => spellResolutionValidationMessages.areaForbiddenForMode({ mode }),
      },
    ],
  },
  point: {
    required: [
      {
        field: 'origin',
        message: () => spellResolutionValidationMessages.originRequiredForPointMode(),
      },
    ],
    forbidden: [
      {
        field: 'target',
        message: (mode) => spellResolutionValidationMessages.targetForbiddenForMode({ mode }),
      },
    ],
  },
  self: {
    forbidden: [
      {
        field: 'target',
        message: (mode) => spellResolutionValidationMessages.targetForbiddenForMode({ mode }),
      },
      {
        field: 'origin',
        message: (mode) => spellResolutionValidationMessages.originForbiddenForMode({ mode }),
      },
    ],
  },
  none: {
    forbidden: [
      {
        field: 'target',
        message: (mode) => spellResolutionValidationMessages.targetForbiddenForMode({ mode }),
      },
      {
        field: 'origin',
        message: (mode) => spellResolutionValidationMessages.originForbiddenForMode({ mode }),
      },
      {
        field: 'areaOfEffect',
        message: (mode) => spellResolutionValidationMessages.areaForbiddenForMode({ mode }),
      },
    ],
  },
}

function hasModeField(
  resolution: SpellResolutionModeValidationInput,
  field: ResolutionModeField,
): boolean {
  return Boolean(resolution[field])
}

function addModeFieldIssue(ctx: z.RefinementCtx, path: ResolutionModeField, message: string): void {
  ctx.addIssue({ code: 'custom', message, path: [path] })
}

export function validateSpellResolutionModeFields(
  resolution: SpellResolutionModeValidationInput,
  ctx: z.RefinementCtx,
): void {
  const rules = MODE_FIELD_RULES[resolution.selectionMode]

  for (const rule of rules.required ?? []) {
    if (hasModeField(resolution, rule.field)) continue
    addModeFieldIssue(ctx, rule.field, rule.message(resolution.selectionMode))
  }

  for (const rule of rules.forbidden ?? []) {
    if (!hasModeField(resolution, rule.field)) continue
    addModeFieldIssue(ctx, rule.field, rule.message(resolution.selectionMode))
  }
}
