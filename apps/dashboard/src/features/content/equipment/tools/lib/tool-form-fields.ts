import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  type ToolEquipment,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import type { EquipmentFormValues } from '../../lib/equipment-form-def'
import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

const toolCategoryOptions = toOptions(TOOL_CATEGORIES, labelsFromEntries(TOOL_CATEGORY_ENTRIES))

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

/** Joins craft item lines for the unified equipment form textarea. */
export function formatCraftsText(items: string[] | undefined): string | undefined {
  return items?.length ? items.join('\n') : undefined
}

/** Tool-specific form fields for the unified equipment form. */
export function toolFormFieldGroup(): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Tool',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'toolCategory',
              label: 'Tool category',
              options: toolCategoryOptions,
              required: true,
              width: '1/2',
            },
            {
              type: 'select',
              name: 'ability',
              label: 'Typical ability',
              options: abilityOptions,
              required: true,
              width: '1/2',
            },
          ],
        },
        {
          type: 'textarea',
          name: 'craftsText',
          label: 'Crafts',
          hint: 'One craftable item per line (optional)',
        },
      ],
    },
    {
      kind: 'array',
      name: 'utilizes',
      legend: 'Utilize actions',
      addLabel: 'Add utilize action',
      min: 1,
      itemTitle: (values: Record<string, unknown>, index: number) =>
        values['description'] ? String(values['description']) : `Action ${index + 1}`,
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'text',
              name: 'description',
              label: 'Description',
              required: true,
            },
            {
              type: 'number',
              name: 'dc',
              label: 'DC',
              min: 1,
              max: 30,
              required: true,
              width: 'auto',
              digits: 2,
            },
          ],
        },
      ],
    },
  ]
}

export function toolFormValuesFromEntity(
  item: ToolEquipment,
): Pick<EquipmentFormValues, 'toolCategory' | 'ability' | 'utilizes' | 'craftsText'> {
  return {
    toolCategory: item.toolCategory,
    ability: item.ability,
    utilizes: item.utilizes,
    craftsText: formatCraftsText(item.crafts),
  }
}
