import { z } from 'zod'
import { abilitySchema, ABILITY_ENTRIES, ABILITY_IDS, slugSchema } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { identityFields } from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

export const skillProficiencyFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  ability: abilitySchema,
})

export type SkillProficiencyFormValues = z.infer<typeof skillProficiencyFormSchema>

export function buildSkillProficiencyFields(ctx: ContentFormCtx): FormItem[] {
  return [
    { kind: 'group', legend: 'Identity', fields: identityFields(ctx) },
    {
      kind: 'group',
      legend: 'Mechanics',
      fields: [
        {
          type: 'chips',
          name: 'ability',
          label: 'Governing ability',
          options: abilityOptions,
          multiple: false,
          required: true,
        },
      ],
    },
  ]
}
