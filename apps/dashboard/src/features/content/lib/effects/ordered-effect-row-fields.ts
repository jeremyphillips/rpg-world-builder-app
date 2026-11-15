import {
  CONDITION_TERM,
  EFFECT_CONDITION_IDS,
  getEffectConditionLabel,
  precedingConditionIdsFromEffects,
} from '@rpg/contracts'
import type { FieldVisibility, FormItem, SelectFieldConfig } from '@rpg/ui/form'

import { effectEndFormFields } from '../forms/mechanics/effect-end-form-fields'
import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import { vocabularyFieldLabel } from '@/features/vocabulary'
import { damageDefinitionFields } from './damage-definition-fields'
import {
  EFFECT_CONDITION_DETAILS_HINT,
  EFFECT_CONDITION_DETAILS_PLACEHOLDER,
  EFFECT_DETAILS_ADD_LABEL,
  EFFECT_DETAILS_LABEL,
  EFFECT_REPLACE_CONDITION_ADD_LABEL,
} from './effect-authoring-copy'

export type OrderedEffectKind = 'damage' | 'condition' | 'note'

function kindVisible(kind: OrderedEffectKind): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (values) => values.kind === kind,
  }
}

function replaceConditionField(precedingEffectsPath: string): SelectFieldConfig {
  const condition = kindVisible('condition')
  return {
    type: 'select',
    name: 'replacesConditionId',
    label: vocabularyFieldLabel(CONDITION_TERM),
    placeholder: 'Choose',
    visibility: condition,
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
      addLabel: EFFECT_REPLACE_CONDITION_ADD_LABEL,
      removeLabel: 'Remove',
    },
  }
}

/** Condition and note rows, plus the shared damage definition group when `kinds` includes damage. */
export function orderedEffectRowFields(options: {
  ctx?: ContentFormCtx
  kinds: readonly OrderedEffectKind[]
  legendVisibility?: 'visible' | 'srOnly'
  precedingEffectsPath?: string
}): FormItem[] {
  const kinds = new Set(options.kinds)
  const fields: FormItem[] = []
  if (kinds.has('damage')) {
    const damage = kindVisible('damage')
    fields.push(
      ...damageDefinitionFields({
        ctx: options.ctx ?? ({} as ContentFormCtx),
        legendVisibility: options.legendVisibility ?? 'srOnly',
        visibility: damage,
      }),
      {
        type: 'text',
        name: 'description',
        label: EFFECT_DETAILS_LABEL,
        visibility: damage,
        optionalDisclosure: { addLabel: EFFECT_DETAILS_ADD_LABEL },
      },
    )
  }
  if (kinds.has('condition')) {
    const condition = kindVisible('condition')
    fields.push(
      {
        type: 'select',
        name: 'conditionId',
        label: vocabularyFieldLabel(CONDITION_TERM),
        placeholder: 'Choose',
        visibility: condition,
        options: EFFECT_CONDITION_IDS.map((id) => ({
          value: id,
          label: getEffectConditionLabel(id),
        })),
      },
      ...effectEndFormFields({ visibility: condition }),
      ...(options.precedingEffectsPath
        ? [replaceConditionField(options.precedingEffectsPath)]
        : []),
      {
        type: 'text',
        name: 'description',
        label: EFFECT_DETAILS_LABEL,
        visibility: condition,
        optionalDisclosure: { addLabel: EFFECT_DETAILS_ADD_LABEL },
        hint: EFFECT_CONDITION_DETAILS_HINT,
        placeholder: EFFECT_CONDITION_DETAILS_PLACEHOLDER,
      },
    )
  }
  if (kinds.has('note')) {
    fields.push({
      type: 'text',
      name: 'description',
      label: EFFECT_DETAILS_LABEL,
      visibility: kindVisible('note'),
      required: true,
    })
  }
  return fields
}
