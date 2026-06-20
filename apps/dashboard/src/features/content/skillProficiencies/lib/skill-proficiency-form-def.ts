import { z } from 'zod'
import {
  abilitySchema,
  ABILITIES,
  ABILITY_IDS,
  createSkillProficiencyInputSchema,
  slugSchema,
  type CreateSkillProficiencyInput,
  type SkillProficiency,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { identityFields } from '../../lib/content-form-field-helpers'
import { contentFormRegistry, type ContentFormDef } from '../../lib/content-form-registry'
import { useSkillProficiencies, skillProficienciesQueryKey } from '../hooks/use-skill-proficiencies'

const abilityOptions = toOptions(ABILITY_IDS, ABILITIES)

const skillProficiencyFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema,
  description: z.string().optional(),
  ability: abilitySchema,
  suggestedClassesText: z.string().optional(),
})

type SkillProficiencyFormValues = z.infer<typeof skillProficiencyFormSchema>

function parseSlugList(text: string | undefined): string[] | undefined {
  if (!text?.trim()) return undefined
  const slugs = text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return slugs.length > 0 ? slugs : undefined
}

function formatSlugList(slugs: string[] | undefined): string | undefined {
  return slugs?.length ? slugs.join(', ') : undefined
}

const skillProficiencyFormDef: ContentFormDef<
  SkillProficiency,
  SkillProficiencyFormValues,
  CreateSkillProficiencyInput
> = {
  routeKey: 'skill-proficiencies',
  schema: skillProficiencyFormSchema,
  coverage: 'structural',
  buildFields: (_ctx): FormItem[] => [
    { kind: 'group', legend: 'Identity', fields: identityFields() },
    {
      kind: 'group',
      legend: 'Mechanics',
      fields: [
        {
          type: 'select',
          name: 'ability',
          label: 'Governing ability',
          options: abilityOptions,
          required: true,
        },
        {
          type: 'text',
          name: 'suggestedClassesText',
          label: 'Suggested classes',
          hint: 'Comma-separated class slugs (optional)',
        },
      ],
    },
  ],
  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    ability: entity.ability,
    suggestedClassesText: formatSlugList(entity.suggestedClasses),
  }),
  toInput: (values) =>
    createSkillProficiencyInputSchema.parse({
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      ability: values.ability,
      suggestedClasses: parseSlugList(values.suggestedClassesText),
    }),
  useListQuery: useSkillProficiencies,
  queryKey: skillProficienciesQueryKey,
}

contentFormRegistry['skill-proficiencies'] = skillProficiencyFormDef

export { skillProficiencyFormDef, skillProficiencyFormSchema }
export type { SkillProficiencyFormValues }
