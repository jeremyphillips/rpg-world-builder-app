import { z } from 'zod'
import { ALIGNMENTS, getAlignmentLabel, optionalAlignmentSchema } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

export const identityFormSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  alignment: optionalAlignmentSchema,
})

export type IdentityFormValues = z.infer<typeof identityFormSchema>

const ALIGNMENT_LABELS = Object.fromEntries(
  ALIGNMENTS.map((alignment) => [alignment, getAlignmentLabel(alignment)]),
) as Record<(typeof ALIGNMENTS)[number], string>

export const identityFormFields: FormItem[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Character name',
    size: 'lg',
    placeholder: 'Enter a name',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Description',
    placeholder: 'Appearance, mannerisms, or backstory notes.',
    rows: 3,
  },
  {
    type: 'select',
    name: 'alignment',
    label: 'Alignment',
    hint: 'Required before you create the character.',
    options: toOptions(ALIGNMENTS, ALIGNMENT_LABELS),
  },
]
