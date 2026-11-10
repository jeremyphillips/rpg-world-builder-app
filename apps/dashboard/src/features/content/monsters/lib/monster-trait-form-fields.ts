import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import { defineMasterDetailItemNoun } from '../../lib/master-detail/master-detail-item-noun'
import {
  MONSTER_ACTION_NAME_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL,
  MONSTER_CUSTOM_DESCRIPTION_HINT,
  MONSTER_CUSTOM_DESCRIPTION_LABEL,
  MONSTER_CUSTOM_NAME_ADD_LABEL,
  MONSTER_CUSTOM_NAME_LABEL,
} from './monster-form-labels'

function visibleForCustomTrait(): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (watched) => watched['kind'] !== 'template',
  }
}

export const MONSTER_TRAIT_ITEM_NOUN = defineMasterDetailItemNoun({
  label: 'Trait',
  singular: 'trait',
  plural: 'traits',
})

export function monsterTraitItemFields(): FormItem[] {
  return [
    {
      type: 'text',
      name: 'name',
      label: MONSTER_ACTION_NAME_LABEL,
      visibility: visibleForCustomTrait(),
    },
    {
      type: 'richtext',
      name: 'description',
      label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
      visibility: visibleForCustomTrait(),
    },
  ]
}

/** Config and optional display overrides for a monster `kind: 'template'` row. */
export function monsterTraitTemplateFields(): FormItem[] {
  return [
    {
      type: 'number',
      name: 'config.uses',
      label: 'Uses',
      min: 1,
      required: true,
      hint: 'Printed on the trait name as N/Day after a long rest.',
      visibility: {
        dependsOn: ['templateId'],
        visibleWhen: (watched) => watched['templateId'] === 'legendary-resistance',
      },
    },
    {
      type: 'text',
      name: 'nameOverride',
      label: MONSTER_CUSTOM_NAME_LABEL,
      optionalDisclosure: { addLabel: MONSTER_CUSTOM_NAME_ADD_LABEL },
    },
    {
      type: 'richtext',
      name: 'descriptionOverride',
      label: MONSTER_CUSTOM_DESCRIPTION_LABEL,
      hint: MONSTER_CUSTOM_DESCRIPTION_HINT,
      optionalDisclosure: { addLabel: MONSTER_CUSTOM_DESCRIPTION_ADD_LABEL },
    },
  ]
}
