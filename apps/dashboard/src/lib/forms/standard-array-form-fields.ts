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
  const label = options.label ?? 'Standard array'

  return {
    kind: 'row',
    heading: {
      label,
      ...(options.hint ? { hint: options.hint } : {}),
    },
    fields: Array.from({ length: STANDARD_ARRAY_LENGTH }, (_, index) => ({
      type: 'number' as const,
      name: `${name}.${index}`,
      label: `${label} score ${index + 1}`,
      labelVisibility: 'srOnly' as const,
      digits: 2,
      width: 'auto' as const,
      required: true,
    })),
  }
}
