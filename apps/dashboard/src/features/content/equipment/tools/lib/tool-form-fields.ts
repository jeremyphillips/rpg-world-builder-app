import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  type ToolEquipment,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import type { EquipmentFormValues } from '../../lib/equipment-form-def'

function labelsFromEntries<const T extends string>(
  entries: Record<T, { label: string }>,
): Record<T, string> {
  return Object.fromEntries(
    (Object.entries(entries) as [T, { label: string }][]).map(([key, value]) => [key, value.label]),
  ) as Record<T, string>
}

const toolCategoryOptions = toOptions(TOOL_CATEGORIES, labelsFromEntries(TOOL_CATEGORY_ENTRIES))

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

/** Tool-specific form field group for the unified equipment form. */
export function toolFormFieldGroup(): FormItem {
  return {
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
            width: '1/2',
          },
        ],
      },
    ],
  }
}

export function toolFormValuesFromEntity(
  item: ToolEquipment,
): Pick<EquipmentFormValues, 'toolCategory' | 'ability'> {
  return {
    toolCategory: item.toolCategory,
    ability: item.ability,
  }
}
