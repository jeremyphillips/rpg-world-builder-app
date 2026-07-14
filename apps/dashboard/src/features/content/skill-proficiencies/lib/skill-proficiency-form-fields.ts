import { z } from 'zod'
import { abilitySchema, ABILITY_ENTRIES, ABILITY_IDS, slugSchema } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const exampleFormItemSchema = z.object({
  value: z.string().min(1),
})

export const skillProficiencyFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  ability: abilitySchema,
  examples: z.array(exampleFormItemSchema).min(1),
})

export type SkillProficiencyFormValues = z.infer<typeof skillProficiencyFormSchema>

export function buildSkillProficiencyFields(_ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Identity',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true },
        {
          type: 'textarea',
          name: 'description',
          label: 'Summary',
          hint: 'Short fragment used in the "{Name} covers …" lead sentence on the detail page.',
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Mechanics',
      fieldsChrome: { variant: 'panel' },
      fields: [
        {
          type: 'chips',
          name: 'ability',
          label: 'Governing ability',
          options: abilityOptions,
          multiple: false,
          required: true,
        },
        {
          kind: 'array',
          name: 'examples',
          legend: 'Examples',
          addLabel: 'Add example',
          min: 1,
          itemVariant: 'compact',
          reorder: false,
          itemHeader: {
            fallback: (index) => `Example ${index + 1}`,
            primaryField: 'value',
          },
          fields: [
            {
              kind: 'row',
              fields: [
                {
                  type: 'text',
                  name: 'value',
                  label: 'Example',
                  required: true,
                  width: 'full',
                },
              ],
            },
          ],
        },
      ],
    },
  ]
}
