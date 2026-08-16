import { z } from 'zod'
import { abilitySchema, ABILITY_ENTRIES, ABILITY_IDS, slugSchema } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { draftOptionalSelect } from '../../lib/forms/draft-form-schema-helpers'

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

const exampleDraftFormItemSchema = z.object({
  value: z.string(),
})

export const skillProficiencyFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  ability: abilitySchema,
  examples: z.array(exampleFormItemSchema).min(1),
})

export const skillProficiencyDraftFormSchema = z.object({
  name: z.string(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  ability: draftOptionalSelect(abilitySchema),
  examples: z.array(exampleDraftFormItemSchema),
})

export type SkillProficiencyFormValues = z.infer<typeof skillProficiencyFormSchema>
export type SkillProficiencyDraftFormValues = z.infer<typeof skillProficiencyDraftFormSchema>

export { nameField as skillProficiencyNameField }

export function buildSkillProficiencyFields(_ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Identity',
      fields: [
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
      chrome: { variant: 'panel' },
      fields: [
        {
          type: 'chips',
          name: 'ability',
          label: 'Governing ability',
          options: abilityOptions,
          multiple: false,
          required: true,
          separator: 'subtle',
        },
        {
          kind: 'array',
          name: 'examples',
          legend: 'Examples',
          addAction: { label: 'Add example', layout: 'inline', size: 'sm' },
          min: 1,
          density: 'comfortable',
          item: {
            reorder: 'dragHandle',
            surface: { emphasis: 'subtle' },
            collapsible: true,
            collapseKey: 'example',
            variant: 'compact',
            inlineAlign: 'center',
            header: {
              fallback: (index) => `Example ${index + 1}`,
              primaryField: 'value',
            },
          },
          fields: [
            {
              kind: 'row',
              fields: [
                {
                  type: 'text',
                  name: 'value',
                  label: 'Example',
                  placeholder: 'Example…',
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
