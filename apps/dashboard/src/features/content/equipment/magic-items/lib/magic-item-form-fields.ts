import {
  MAGIC_ITEM_CATEGORIES,
  MAGIC_ITEM_CATEGORY_ENTRIES,
  MAGIC_ITEM_RARITIES,
  MAGIC_ITEM_RARITY_ENTRIES,
  MAGIC_ITEM_RARITY_TERM,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { vocabularyFieldLabel } from '@/features/homebrew'

import { getContentTypeMidSentenceLabel } from '@/features/content/lib/content-type-labels'
import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

const magicItemRarityOptions = toOptions(
  MAGIC_ITEM_RARITIES,
  labelsFromEntries(MAGIC_ITEM_RARITY_ENTRIES),
)

const magicItemCategoryOptions = toOptions(
  MAGIC_ITEM_CATEGORIES,
  labelsFromEntries(MAGIC_ITEM_CATEGORY_ENTRIES),
)

/** Magic item-specific form field group for the unified equipment form. */
export function magicItemFormFieldGroup(ctx: ContentFormCtx = {}): FormItem {
  return {
    kind: 'group',
    legend: '',
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'rarity',
            label: vocabularyFieldLabel(MAGIC_ITEM_RARITY_TERM),
            options: magicItemRarityOptions,
          },
          {
            type: 'select',
            name: 'magicItemCategory',
            label: 'Category',
            options: magicItemCategoryOptions,
          },
        ],
      },
      {
        kind: 'dependent',
        controller: {
          type: 'switch',
          name: 'requiresAttunement',
          label: 'Requires attunement',
        },
        dependents: {
          surface: 'subtle',
          fields: [
            {
              type: 'text',
              name: 'attunementRequirement',
              label: 'Attunement requirement',
            },
          ],
        },
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'combobox',
            name: 'baseEquipmentId',
            label: `Base ${getContentTypeMidSentenceLabel('equipment')}`,
            multiple: false,
            width: 'full',
            options: ctx.options?.magicItemBaseEquipment ?? [],
          },
        ],
      },
    ],
  }
}
