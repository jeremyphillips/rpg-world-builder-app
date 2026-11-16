import { CONDITION_TERM, getEffectConditionLabel } from '@rpg/contracts'
import type { ArrayConfig, FieldLabelVisibility, FieldVisibility } from '@rpg/ui/form'

import { vocabularyFieldLabel } from '@/features/vocabulary'
import {
  EFFECT_ADD_LABEL,
  EFFECT_DAMAGE_LABEL,
  EFFECT_NOTE_LABEL,
} from '../../effects/effect-authoring-copy'
import {
  orderedEffectRowFields,
  type OrderedEffectKind,
} from '../../effects/ordered-effect-row-fields'
import type { ContentFormCtx } from '../registry/content-form-registry'

const ORDERED_EFFECT_KINDS = [
  'damage',
  'condition',
  'note',
] as const satisfies readonly OrderedEffectKind[]

function orderedEffectTitle(values: Record<string, unknown>, index: number): string {
  if (values.kind === 'damage') return EFFECT_DAMAGE_LABEL
  if (values.kind === 'condition' && typeof values.conditionId === 'string') {
    return getEffectConditionLabel(values.conditionId)
  }
  if (values.kind === 'condition') return vocabularyFieldLabel(CONDITION_TERM)
  if (values.kind === 'note') return EFFECT_NOTE_LABEL
  return `Effect ${index + 1}`
}

export function buildOrderedEffectAddMenu(allowedEffectKinds?: readonly OrderedEffectKind[]) {
  const allowed = new Set<OrderedEffectKind>(allowedEffectKinds ?? ORDERED_EFFECT_KINDS)
  return [
    ...(allowed.has('damage')
      ? [
          {
            id: 'damage',
            label: EFFECT_DAMAGE_LABEL,
            appendDefaults: {
              kind: 'damage',
              roll: { dice: { count: 1, faces: 6 } },
            },
          },
        ]
      : []),
    ...(allowed.has('condition')
      ? [
          {
            id: 'condition',
            label: vocabularyFieldLabel(CONDITION_TERM),
            appendDefaults: { kind: 'condition' },
          },
        ]
      : []),
    ...(allowed.has('note')
      ? [
          {
            id: 'note',
            label: EFFECT_NOTE_LABEL,
            appendDefaults: { kind: 'note' },
          },
        ]
      : []),
  ]
}

export type OrderedEffectFormFieldsOptions = {
  ctx: ContentFormCtx
  arrayName: string
  /** When set, condition rows may reference a condition from this effects array path. */
  precedingEffectsPath?: string
  heading?: {
    label: string
    hint?: string
    labelVisibility?: FieldLabelVisibility
  }
  legendVisibility?: 'visible' | 'srOnly'
  visibility?: FieldVisibility
}

/** Context-neutral ordered damage / condition / note array for on-hit effects. */
export function orderedEffectFormFields(options: OrderedEffectFormFieldsOptions): ArrayConfig {
  const legendVisibility = options.legendVisibility ?? 'srOnly'

  return {
    kind: 'array',
    name: options.arrayName,
    ...(options.visibility ? { visibility: options.visibility } : {}),
    ...(options.heading
      ? {
          heading: {
            label: options.heading.label,
            ...(options.heading.hint ? { hint: options.heading.hint } : {}),
            ...(options.heading.labelVisibility
              ? { labelVisibility: options.heading.labelVisibility }
              : {}),
          },
        }
      : {}),
    addAction: {
      label: EFFECT_ADD_LABEL,
      menu: {
        groups: [],
        enableSearch: false,
        items: buildOrderedEffectAddMenu(),
      },
    },
    item: {
      collapsible: true,
      header: {
        fallback: (index) => `Effect ${index + 1}`,
        primary: (values, index) => orderedEffectTitle(values, index),
      },
    },
    fields: orderedEffectRowFields({
      ctx: options.ctx,
      kinds: ORDERED_EFFECT_KINDS,
      legendVisibility,
      precedingEffectsPath: options.precedingEffectsPath,
    }),
  }
}
