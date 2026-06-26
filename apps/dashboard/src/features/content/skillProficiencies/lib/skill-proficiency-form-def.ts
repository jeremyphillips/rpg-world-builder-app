import { z } from 'zod'
import {
  abilitySchema,
  ABILITY_ENTRIES,
  ABILITY_IDS,
  createSkillProficiencyInputSchema,
  slugSchema,
  type CreateSkillProficiencyInput,
  type SkillProficiency,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { identityFields } from '../../lib/content-form-field-helpers'
import {
  contentFormRegistry,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { finalizeContentInput, slugForInputParse } from '../../lib/content-form-key-helpers'
import { useSkillProficiencies, skillProficienciesQueryKey } from '../hooks/use-skill-proficiencies'

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const SUGGESTED_CLASSES_HINT =
  'Classes that suggest this skill for starting proficiency selection. Used by the character builder to restrict skill picks.'

const skillProficiencyFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  ability: abilitySchema,
  suggestedClasses: z.array(z.string()).min(1),
})

type SkillProficiencyFormValues = z.infer<typeof skillProficiencyFormSchema>

const skillProficiencyFormDef: ContentFormDef<
  SkillProficiency,
  SkillProficiencyFormValues,
  CreateSkillProficiencyInput
> = {
  routeKey: 'skill-proficiencies',
  schema: skillProficiencyFormSchema,
  coverage: 'structural',
  buildFields: (ctx): FormItem[] => [
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
        {
          type: 'chips',
          name: 'suggestedClasses',
          label: 'Suggested classes',
          options: ctx.options?.classes ?? [],
          required: true,
          hint: SUGGESTED_CLASSES_HINT,
        },
      ],
    },
  ],
  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    ability: entity.ability,
    suggestedClasses: entity.suggestedClasses,
  }),
  toInput: (values, ctx?: ContentFormInputCtx<SkillProficiency>) => {
    const input = createSkillProficiencyInputSchema.parse({
      slug: slugForInputParse(values.name, ctx),
      name: values.name,
      description: values.description || undefined,
      ability: values.ability,
      suggestedClasses: values.suggestedClasses,
    })
    return finalizeContentInput(input, ctx) as CreateSkillProficiencyInput
  },
  useListQuery: useSkillProficiencies,
  queryKey: skillProficienciesQueryKey,
}

contentFormRegistry['skill-proficiencies'] = skillProficiencyFormDef

export { skillProficiencyFormDef, skillProficiencyFormSchema }
export type { SkillProficiencyFormValues }
