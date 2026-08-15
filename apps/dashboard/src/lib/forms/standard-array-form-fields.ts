import { STANDARD_ARRAY_LENGTH } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

export type StandardArrayFormFieldOptions = {
  name?: string
  label?: string
  hint?: string
}

/** Six inline two-character-width numeric inputs for a Standard Array. */
export function standardArrayFormFields(options: StandardArrayFormFieldOptions = {}): FormItem {
  const name = options.name ?? 'standardArray'

  return {
    kind: 'group',
    legend: options.label ?? 'Standard array',
    description: options.hint,
    legendSize: 'subsection',
    fields: [
      {
        kind: 'row',
        fields: Array.from({ length: STANDARD_ARRAY_LENGTH }, (_, index) => ({
          type: 'number' as const,
          name: `${name}.${index}`,
          label: '',
          digits: 2,
          width: 'auto' as const,
          required: true,
        })),
      },
    ],
  }
}
