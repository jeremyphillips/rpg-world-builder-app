import { z } from 'zod'

import type { FormItem } from '@rpg/ui/form'

export const duplicateContentFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
})

export type DuplicateContentFormValues = z.infer<typeof duplicateContentFormSchema>

export const duplicateContentFormFields: FormItem[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Name',
    required: true,
    width: 'full',
  },
]

export function buildDuplicateContentDefaultValues(sourceName: string): DuplicateContentFormValues {
  return { name: `${sourceName} Copy` }
}
