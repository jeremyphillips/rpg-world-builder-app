import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

const toolCategoryOptions = toOptions(TOOL_CATEGORIES, labelsFromEntries(TOOL_CATEGORY_ENTRIES))

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

/** Tool-specific form fields for the unified equipment form. */
export function toolFormFieldGroup(): FormItem[] {
  return [
    {
      kind: 'group',
      legend: '',
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
      addActionLabel: 'Add utilize action',
      min: 1,
      itemCollapsible: true,
      itemChrome: 'subtle',
      size: 'md',
      addActionLayout: 'inline',
      itemHeader: {
        fallback: (index) => `Action ${index + 1}`,
        primaryField: 'description',
      },
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'text',
              name: 'description',
              label: 'Description',
              required: true,
              width: 'full',
            },
            {
              type: 'number',
              name: 'dc',
              label: 'DC',
              min: 1,
              max: 30,
              required: true,
              digits: 2,
              width: 'auto',
            },
          ],
        },
      ],
    },
  ]
}
