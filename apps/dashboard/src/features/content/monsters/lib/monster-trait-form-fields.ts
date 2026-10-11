import type { FormItem } from '@rpg/ui/form'

import { defineMasterDetailItemNoun } from '../../lib/master-detail/master-detail-item-noun'
import { MONSTER_ACTION_NAME_LABEL, MONSTER_CUSTOM_DESCRIPTION_LABEL } from './monster-form-labels'

export const MONSTER_TRAIT_ITEM_NOUN = defineMasterDetailItemNoun({
  label: 'Trait',
  singular: 'trait',
  plural: 'traits',
})

export const MONSTER_ACTION_ITEM_NOUN = defineMasterDetailItemNoun({
  label: 'Action',
  singular: 'action',
  plural: 'actions',
})

export function monsterTraitItemFields(): FormItem[] {
  return [
    { type: 'text', name: 'name', label: MONSTER_ACTION_NAME_LABEL },
    { type: 'richtext', name: 'description', label: MONSTER_CUSTOM_DESCRIPTION_LABEL },
  ]
}
