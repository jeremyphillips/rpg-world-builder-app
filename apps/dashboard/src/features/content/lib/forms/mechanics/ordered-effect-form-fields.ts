import { CONDITION_TERM, EFFECT_CONDITION_IDS, getEffectConditionLabel } from '@rpg/contracts'
import type {
  ArrayConfig,
  FieldConfig,
  FieldLabelVisibility,
  FieldVisibility,
  SelectFieldConfig,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../registry/content-form-registry'
import { damageFieldGroup } from './damage-field-group'
import { effectEndFormFields } from './effect-end-form-fields'
import { vocabularyFieldLabel } from '@/features/vocabulary'
import {
  MONSTER_ACTION_DAMAGE_FIELD_LABEL,
  MONSTER_ON_HIT_ADD_LABEL,
  MONSTER_ON_HIT_CONDITION_DETAILS_HINT,
  MONSTER_ON_HIT_CONDITION_DETAILS_PLACEHOLDER,
  MONSTER_ON_HIT_DETAILS_ADD_LABEL,
  MONSTER_ON_HIT_DETAILS_LABEL,
  MONSTER_ON_HIT_NOTE_LABEL,
  MONSTER_ORDERED_EFFECT_REPLACE_CONDITION_ADD_LABEL,
} from '../../../monsters/lib/monster-form-labels'
import { precedingConditionIdsFromEffects } from '../../../monsters/lib/actions/monster-action-save-outcomes'

const DEFAULT_ORDERED_EFFECT_KINDS = ['damage', 'condition', 'note'] as const

function effectKindVisible(kind: 'damage' | 'condition' | 'note'): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (values) => values.kind === kind,
  }
}

function orderedEffectTitle(values: Record<string, unknown>, index: number): string {
  if (values.kind === 'damage') return MONSTER_ACTION_DAMAGE_FIELD_LABEL
  if (values.kind === 'condition' && typeof values.conditionId === 'string') {
    return getEffectConditionLabel(values.conditionId)
  }
  if (values.kind === 'condition') return vocabularyFieldLabel(CONDITION_TERM)
  if (values.kind === 'note') return MONSTER_ON_HIT_NOTE_LABEL
  return `Effect ${index + 1}`
}

type OrderedEffectKind = 'damage' | 'condition' | 'note'

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
  /** Omits damage from the add menu when envelope damage owns failed/success amounts. */
  allowedEffectKinds?: readonly OrderedEffectKind[]
}

function allowedEffectKindSet(
  allowedEffectKinds: readonly OrderedEffectKind[] | undefined,
): Set<OrderedEffectKind> {
  return new Set(allowedEffectKinds ?? DEFAULT_ORDERED_EFFECT_KINDS)
}

export function buildOrderedEffectAddMenuItems(allowed: Set<OrderedEffectKind>) {
  const items: Array<{
    id: OrderedEffectKind
    label: string
    appendDefaults: Record<string, unknown>
  }> = []
  if (allowed.has('damage')) {
    items.push({
      id: 'damage',
      label: MONSTER_ACTION_DAMAGE_FIELD_LABEL,
      appendDefaults: {
        kind: 'damage',
        roll: { dice: { count: 1, faces: 6 } },
      },
    })
  }
  if (allowed.has('condition')) {
    items.push({
      id: 'condition',
      label: vocabularyFieldLabel(CONDITION_TERM),
      appendDefaults: { kind: 'condition' },
    })
  }
  if (allowed.has('note')) {
    items.push({
      id: 'note',
      label: MONSTER_ON_HIT_NOTE_LABEL,
      appendDefaults: { kind: 'note' },
    })
  }
  return items
}

function buildReplaceConditionField(
  precedingEffectsPath: string,
  conditionVisibility: FieldVisibility,
): SelectFieldConfig {
  return {
    type: 'select',
    name: 'replacesConditionId',
    label: vocabularyFieldLabel(CONDITION_TERM),
    placeholder: 'Choose',
    visibility: conditionVisibility,
    optionsResolve: {
      dependsOn: [precedingEffectsPath],
      optionsWhen: (values: Record<string, unknown>) => {
        const raw = values[precedingEffectsPath]
        return precedingConditionIdsFromEffects(raw).map((id) => ({
          value: id,
          label: getEffectConditionLabel(id),
        }))
      },
    },
    optionalDisclosure: {
      addLabel: MONSTER_ORDERED_EFFECT_REPLACE_CONDITION_ADD_LABEL,
      removeLabel: 'Remove',
    },
  }
}

function buildOrderedEffectRowFields(options: {
  ctx: ContentFormCtx
  legendVisibility: 'visible' | 'srOnly'
  damage: FieldVisibility
  condition: FieldVisibility
  note: FieldVisibility
  replaceConditionField?: SelectFieldConfig
}): FieldConfig[] {
  const conditionDetails = effectKindVisible('condition')
  const damageDetails = effectKindVisible('damage')

  return [
    damageFieldGroup({
      ctx: options.ctx,
      damageTypeName: 'damageType',
      rollName: 'roll',
      legendVisibility: options.legendVisibility,
      visibility: options.damage,
    }),
    {
      type: 'select',
      name: 'conditionId',
      label: vocabularyFieldLabel(CONDITION_TERM),
      placeholder: 'Choose',
      visibility: options.condition,
      options: EFFECT_CONDITION_IDS.map((id) => ({
        value: id,
        label: getEffectConditionLabel(id),
      })),
    },
    ...effectEndFormFields({ visibility: options.condition }),
    ...(options.replaceConditionField ? [options.replaceConditionField] : []),
    {
      type: 'text',
      name: 'description',
      label: MONSTER_ON_HIT_DETAILS_LABEL,
      visibility: damageDetails,
      optionalDisclosure: { addLabel: MONSTER_ON_HIT_DETAILS_ADD_LABEL },
    },
    {
      type: 'text',
      name: 'description',
      label: MONSTER_ON_HIT_DETAILS_LABEL,
      visibility: conditionDetails,
      optionalDisclosure: { addLabel: MONSTER_ON_HIT_DETAILS_ADD_LABEL },
      hint: MONSTER_ON_HIT_CONDITION_DETAILS_HINT,
      placeholder: MONSTER_ON_HIT_CONDITION_DETAILS_PLACEHOLDER,
    },
    {
      type: 'text',
      name: 'description',
      label: MONSTER_ON_HIT_DETAILS_LABEL,
      visibility: options.note,
      required: true,
    },
  ]
}

/** Context-neutral ordered damage / condition / note array for on-hit and save outcomes. */
export function orderedEffectFormFields(options: OrderedEffectFormFieldsOptions): ArrayConfig {
  const damage = effectKindVisible('damage')
  const condition = effectKindVisible('condition')
  const note = effectKindVisible('note')
  const allowed = allowedEffectKindSet(options.allowedEffectKinds)
  const menuItems = buildOrderedEffectAddMenuItems(allowed)
  const replaceConditionField = options.precedingEffectsPath
    ? buildReplaceConditionField(options.precedingEffectsPath, condition)
    : undefined
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
      label: MONSTER_ON_HIT_ADD_LABEL,
      menu: {
        groups: [],
        enableSearch: false,
        items: menuItems,
      },
    },
    item: {
      collapsible: true,
      header: {
        fallback: (index) => `Effect ${index + 1}`,
        primary: (values, index) => orderedEffectTitle(values, index),
      },
    },
    fields: buildOrderedEffectRowFields({
      ctx: options.ctx,
      legendVisibility,
      damage,
      condition,
      note,
      replaceConditionField,
    }),
  }
}
