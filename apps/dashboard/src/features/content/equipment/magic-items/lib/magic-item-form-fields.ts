import {
  MAGIC_ITEM_CATEGORIES,
  MAGIC_ITEM_CATEGORY_ENTRIES,
  MAGIC_ITEM_RARITIES,
  MAGIC_ITEM_RARITY_ENTRIES,
  type MagicItemEquipment,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/content-form-registry'
import type { EquipmentFormValues } from '../../lib/equipment-form-def'

function labelsFromEntries<const T extends string>(
  entries: Record<T, { label: string }>,
): Record<T, string> {
  return Object.fromEntries(
    (Object.entries(entries) as [T, { label: string }][]).map(([key, value]) => [key, value.label]),
  ) as Record<T, string>
}

const magicItemRarityOptions = toOptions(
  MAGIC_ITEM_RARITIES,
  labelsFromEntries(MAGIC_ITEM_RARITY_ENTRIES),
)

const magicItemCategoryOptions = toOptions(
  MAGIC_ITEM_CATEGORIES,
  labelsFromEntries(MAGIC_ITEM_CATEGORY_ENTRIES),
)

function visibleWhenAttunementRequired(): FieldVisibility {
  return {
    dependsOn: ['requiresAttunement'],
    visibleWhen: (v) => v.requiresAttunement === true,
  }
}

/** Magic item-specific form field group for the unified equipment form. */
export function magicItemFormFieldGroup(ctx: ContentFormCtx = {}): FormItem {
  return {
    kind: 'group',
    legend: 'Magic Item',
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'rarity',
            label: 'Rarity',
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
        type: 'switch',
        name: 'requiresAttunement',
        label: 'Requires attunement',
      },
      {
        type: 'text',
        name: 'attunementRequirement',
        label: 'Attunement requirement',
        visibility: visibleWhenAttunementRequired(),
      },
      {
        kind: 'row',
        layout: 'responsive-2',
        fields: [
          {
            type: 'combobox',
            name: 'baseEquipmentId',
            label: 'Base equipment',
            multiple: false,
            width: 'full',
            options: ctx.options?.magicItemBaseEquipment ?? [],
          },
        ],
      },
    ],
  }
}

export function magicItemFormValuesFromEntity(
  item: MagicItemEquipment,
): Pick<
  EquipmentFormValues,
  | 'rarity'
  | 'requiresAttunement'
  | 'attunementRequirement'
  | 'magicItemCategory'
  | 'baseEquipmentId'
> {
  return {
    rarity: item.rarity,
    requiresAttunement: item.requiresAttunement,
    attunementRequirement: item.attunementRequirement,
    magicItemCategory: item.magicItemCategory,
    baseEquipmentId: item.baseEquipmentId,
  }
}
