import {
  REST_KIND_ENTRIES,
  REST_KINDS,
  SPELL_COMPONENT_ENTRIES,
  SPELL_COMPONENT_IDS,
  PROFICIENCY_BONUS_TERM,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { damageTypeField } from '../../../lib/forms/mechanics/damage-type-field'
import { rollValueFields } from '../../../lib/forms/mechanics/roll-value-fields'
import { vocabularyFieldLabel } from '@/features/vocabulary'
import {
  MONSTER_ACTION_DAMAGE_FIELD_LABEL,
  MONSTER_LIMIT_RECHARGES_ON_LABEL,
  monsterLimitRechargesOnHint,
  MONSTER_ON_HIT_HINT,
  MONSTER_ON_HIT_LEGEND,
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

export function monsterActionLimitedUseFields(): FormItem[] {
  const uses = limitVisibility('uses')
  const recharge = limitVisibility('recharge')
  const fixed = {
    dependsOn: ['limitedUse.kind', 'limitedUse.count.kind'],
    visibleWhen: (values: Record<string, unknown>) =>
      values['limitedUse.kind'] === 'uses' && values['limitedUse.count.kind'] === 'fixed',
  }
  return [
    {
      kind: 'group',
      heading: { label: 'Limit' },
      headingScale: 'subsection',
      fields: [
        {
          kind: 'dependent',
          controller: {
            type: 'select',
            name: 'limitedUse.kind',
            label: 'Limit',
            labelVisibility: 'srOnly',
            placeholder: 'No limit',
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
      ],
    },
  ]
}

export function monsterActionOnHitFields(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'array',
    name: 'onHit.additionalDamage',
    label: MONSTER_ON_HIT_LEGEND,
    hint: MONSTER_ON_HIT_HINT,
    addAction: { label: 'Add damage' },
    item: { header: { fallback: (index) => `Damage ${index + 1}` } },
    fields: [
      damageTypeField({ name: 'damageType', ctx, required: true }),
      ...rollValueFields({
        namePrefix: 'roll',
        label: MONSTER_ACTION_DAMAGE_FIELD_LABEL,
        required: true,
      }),
    ],
  }
}

export function spellComponentField(): FormItem {
  return {
    type: 'chips',
    name: 'omittedComponents',
    label: 'Omitted components',
    options: SPELL_COMPONENT_IDS.map((id) => ({
      value: id,
      label: SPELL_COMPONENT_ENTRIES[id].label,
    })),
  }
}
