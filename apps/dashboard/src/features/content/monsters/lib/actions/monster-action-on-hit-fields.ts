import {
  REST_KIND_ENTRIES,
  REST_KINDS,
  SPELL_COMPONENT_ENTRIES,
  SPELL_COMPONENT_IDS,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { damageTypeField } from '../../../lib/forms/mechanics/damage-type-field'
import { rollValueFields } from '../../../lib/forms/mechanics/roll-value-fields'

function limitVisibility(kind: 'uses' | 'recharge') {
  return {
    dependsOn: ['limitedUse.kind'],
    visibleWhen: (values: Record<string, unknown>) => values['limitedUse.kind'] === kind,
  }
}

export function monsterActionLimitedUseFields(): FormItem[] {
  const uses = limitVisibility('uses')
  const fixed = {
    dependsOn: ['limitedUse.kind', 'limitedUse.count.kind'],
    visibleWhen: (values: Record<string, unknown>) =>
      values['limitedUse.kind'] === 'uses' && values['limitedUse.count.kind'] === 'fixed',
  }
  return [
    {
      type: 'select',
      name: 'limitedUse.kind',
      label: 'Limit',
      placeholder: 'No limit',
      options: [
        { value: 'uses', label: 'Uses' },
        { value: 'recharge', label: 'Recharge' },
      ],
    },
    {
      type: 'number',
      name: 'limitedUse.minRoll',
      label: 'Minimum roll',
      min: 2,
      max: 6,
      visibility: limitVisibility('recharge'),
    },
    {
      type: 'select',
      name: 'limitedUse.count.kind',
      label: 'Count',
      placeholder: 'Choose',
      options: [
        { value: 'fixed', label: 'Fixed number' },
        { value: 'proficiency-bonus', label: 'Proficiency bonus' },
      ],
      visibility: uses,
    },
    {
      type: 'number',
      name: 'limitedUse.count.value',
      label: 'Uses',
      min: 1,
      visibility: fixed,
    },
    {
      type: 'select',
      name: 'limitedUse.recovery.minimumRest',
      label: 'Recovers on',
      placeholder: 'Choose',
      options: REST_KINDS.map((id) => ({ value: id, label: REST_KIND_ENTRIES[id].label })),
      visibility: uses,
    },
  ]
}

export function monsterActionOnHitFields(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'array',
    name: 'onHit.additionalDamage',
    legend: 'On hit',
    addAction: { label: 'Add damage' },
    item: { header: { fallback: (index) => `Damage ${index + 1}` } },
    fields: [
      damageTypeField({ name: 'damageType', ctx, required: true }),
      ...rollValueFields({ namePrefix: 'roll', label: 'Damage', required: true }),
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
