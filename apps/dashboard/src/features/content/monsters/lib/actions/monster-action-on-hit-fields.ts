import {
  CONDITION_TERM,
  EFFECT_CONDITION_IDS,
  getEffectConditionLabel,
  REST_KIND_ENTRIES,
  REST_KINDS,
  PROFICIENCY_BONUS_TERM,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { damageFieldGroup } from '../../../lib/forms/mechanics/damage-field-group'
import { vocabularyFieldLabel } from '@/features/vocabulary'
import {
  MONSTER_LIMIT_ADD_LABEL,
  MONSTER_LIMIT_RECHARGES_ON_LABEL,
  monsterLimitRechargesOnHint,
  MONSTER_ON_HIT_ADD_LABEL,
  MONSTER_ON_HIT_DETAILS_ADD_LABEL,
  MONSTER_ON_HIT_DETAILS_LABEL,
  MONSTER_ON_HIT_HINT,
  MONSTER_ON_HIT_KIND_LABEL,
  MONSTER_ON_HIT_LEGEND,
  MONSTER_ON_HIT_NOTE_LABEL,
  MONSTER_ACTION_DAMAGE_FIELD_LABEL,
} from '../monster-form-labels'

function limitVisibility(kind: 'uses' | 'recharge') {
  return {
    dependsOn: ['limitedUse.kind'],
    visibleWhen: (values: Record<string, unknown>) => values['limitedUse.kind'] === kind,
  }
}

function limitedUseDependentsVisible(): {
  dependsOn: string[]
  visibleWhen: (values: Record<string, unknown>) => boolean
} {
  return {
    dependsOn: ['limitedUse.kind'],
    visibleWhen: (values) =>
      values['limitedUse.kind'] === 'uses' || values['limitedUse.kind'] === 'recharge',
  }
}

export function monsterActionLimitedUseFields(options?: { addDisabled?: boolean }): FormItem[] {
  const uses = limitVisibility('uses')
  const recharge = limitVisibility('recharge')
  const fixed = {
    dependsOn: ['limitedUse.kind', 'limitedUse.count.kind'],
    visibleWhen: (values: Record<string, unknown>) =>
      values['limitedUse.kind'] === 'uses' && values['limitedUse.count.kind'] === 'fixed',
  }
  return [
    {
      kind: 'dependent',
      controller: {
        type: 'select',
        name: 'limitedUse.kind',
        label: 'Limit',
        placeholder: 'No limit',
        optionalDisclosure: {
          addLabel: MONSTER_LIMIT_ADD_LABEL,
          ...(options?.addDisabled ? { addDisabled: true } : {}),
        },
        options: [
          { value: 'uses', label: 'Uses' },
          { value: 'recharge', label: 'Recharge' },
        ],
      },
      dependents: {
        chrome: 'none',
        visibility: limitedUseDependentsVisible(),
        fields: [
          {
            type: 'number',
            name: 'limitedUse.minRoll',
            label: MONSTER_LIMIT_RECHARGES_ON_LABEL,
            labelPosition: 'settings',
            min: 2,
            max: 6,
            digits: 2,
            visibility: recharge,
            hint: {
              resolve: {
                dependsOn: ['limitedUse.minRoll'],
                hintWhen: (values) => monsterLimitRechargesOnHint(values['limitedUse.minRoll']),
              },
            },
          },
          {
            kind: 'row',
            visibility: uses,
            fields: [
              {
                type: 'select',
                name: 'limitedUse.count.kind',
                label: 'Count',
                placeholder: 'Choose',
                width: '1/2',
                options: [
                  { value: 'fixed', label: 'Fixed number' },
                  {
                    value: 'proficiency-bonus',
                    label: vocabularyFieldLabel(PROFICIENCY_BONUS_TERM),
                  },
                ],
              },
              {
                type: 'select',
                name: 'limitedUse.recovery.minimumRest',
                label: 'Recovers on',
                placeholder: 'Choose',
                width: '1/2',
                options: REST_KINDS.map((id) => ({
                  value: id,
                  label: REST_KIND_ENTRIES[id].label,
                })),
              },
            ],
          },
          {
            type: 'number',
            name: 'limitedUse.count.value',
            label: 'Uses',
            min: 1,
            digits: 2,
            visibility: fixed,
          },
        ],
      },
    },
  ]
}

function effectKindVisible(kind: 'damage' | 'condition' | 'note') {
  return {
    dependsOn: ['kind'],
    visibleWhen: (values: Record<string, unknown>) => values.kind === kind,
  }
}

function onHitEffectTitle(values: Record<string, unknown>, index: number): string {
  if (values.kind === 'damage') return MONSTER_ACTION_DAMAGE_FIELD_LABEL
  if (values.kind === 'condition' && typeof values.conditionId === 'string') {
    return getEffectConditionLabel(values.conditionId)
  }
  if (values.kind === 'condition') return vocabularyFieldLabel(CONDITION_TERM)
  if (values.kind === 'note') return MONSTER_ON_HIT_NOTE_LABEL
  return `Effect ${index + 1}`
}

export function monsterActionOnHitFields(ctx: ContentFormCtx): FormItem {
  const damage = effectKindVisible('damage')
  const condition = effectKindVisible('condition')
  const note = effectKindVisible('note')
  const qualified = {
    dependsOn: ['kind'],
    visibleWhen: (values: Record<string, unknown>) =>
      values.kind === 'damage' || values.kind === 'condition',
  }
  return {
    kind: 'array',
    name: 'onHit.effects',
    heading: { label: MONSTER_ON_HIT_LEGEND, hint: MONSTER_ON_HIT_HINT },
    addAction: {
      label: MONSTER_ON_HIT_ADD_LABEL,
      menu: {
        groups: [],
        enableSearch: false,
        items: [
          {
            id: 'damage',
            label: MONSTER_ACTION_DAMAGE_FIELD_LABEL,
            appendDefaults: {
              kind: 'damage',
              roll: { dice: { count: 1, faces: 6 } },
            },
          },
          {
            id: 'condition',
            label: vocabularyFieldLabel(CONDITION_TERM),
            appendDefaults: { kind: 'condition' },
          },
          {
            id: 'note',
            label: MONSTER_ON_HIT_NOTE_LABEL,
            appendDefaults: { kind: 'note' },
          },
        ],
      },
    },
    item: {
      header: {
        fallback: (index) => `Effect ${index + 1}`,
        primary: (values, index) => onHitEffectTitle(values, index),
      },
    },
    fields: [
      {
        type: 'select',
        name: 'kind',
        label: MONSTER_ON_HIT_KIND_LABEL,
        placeholder: 'Choose',
        options: [
          { value: 'damage', label: MONSTER_ACTION_DAMAGE_FIELD_LABEL },
          { value: 'condition', label: vocabularyFieldLabel(CONDITION_TERM) },
          { value: 'note', label: MONSTER_ON_HIT_NOTE_LABEL },
        ],
      },
      damageFieldGroup({
        ctx,
        damageTypeName: 'damageType',
        rollName: 'roll',
        legendVisibility: 'srOnly',
        visibility: damage,
      }),
      {
        type: 'select',
        name: 'conditionId',
        label: vocabularyFieldLabel(CONDITION_TERM),
        placeholder: 'Choose',
        visibility: condition,
        options: EFFECT_CONDITION_IDS.map((id) => ({
          value: id,
          heading: { label: getEffectConditionLabel(id) },
        })),
      },
      {
        type: 'text',
        name: 'description',
        label: MONSTER_ON_HIT_DETAILS_LABEL,
        visibility: qualified,
        optionalDisclosure: { addLabel: MONSTER_ON_HIT_DETAILS_ADD_LABEL },
      },
      {
        type: 'text',
        name: 'description',
        label: MONSTER_ON_HIT_DETAILS_LABEL,
        visibility: note,
        required: true,
      },
    ],
  }
}
