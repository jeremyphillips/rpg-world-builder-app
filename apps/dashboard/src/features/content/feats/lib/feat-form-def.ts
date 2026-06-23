import { z } from 'zod'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  FEAT_CATEGORY_ENTRIES,
  FEAT_CATEGORY_IDS,
  FEAT_PART_ENTRIES,
  abilitySchema,
  createFeatInputSchema,
  slugSchema,
  type CreateFeatInput,
  type Feat,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { identityFields } from '../../lib/content-form-field-helpers'
import {
  contentFormRegistry,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { finalizeContentInput, slugForInputParse } from '../../lib/content-form-key-helpers'
import { useFeats, featsQueryKey } from '../hooks/use-feats'
import {
  FEAT_PREREQUISITE_PATTERNS,
  prerequisiteFromFormValues,
  prerequisiteToFormValues,
  refineFeatPrerequisiteFields,
  type FeatPrerequisitePattern,
} from './feat-prerequisite-form-helpers'

export { FEAT_PREREQUISITE_PATTERNS, type FeatPrerequisitePattern }
export {
  prerequisiteFromFormValues,
  prerequisiteToFormValues,
} from './feat-prerequisite-form-helpers'

const featCategoryOptions = toOptions(
  FEAT_CATEGORY_IDS,
  Object.fromEntries(
    FEAT_CATEGORY_IDS.map((id) => [id, FEAT_CATEGORY_ENTRIES[id].label]),
  ) as Record<(typeof FEAT_CATEGORY_IDS)[number], string>,
)

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const prerequisitePatternOptions = [
  { value: 'none', label: 'No prerequisite' },
  { value: 'min-level', label: 'Minimum character level' },
  { value: 'feature', label: 'Class feature' },
  { value: 'level-and-abilities', label: 'Level + ability scores (OR)' },
  { value: 'level-and-spellcasting', label: 'Level + spellcasting feature' },
] as const

const featFormSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    category: z.enum(FEAT_CATEGORY_IDS),
    prerequisitePattern: z.enum(FEAT_PREREQUISITE_PATTERNS),
    prerequisiteMinLevel: z.coerce.number().int().optional(),
    prerequisiteFeatureId: z.string().optional(),
    prerequisiteAbilities: z.array(abilitySchema).optional(),
    prerequisiteAbilityMinimum: z.coerce.number().int().optional(),
    repeatableAllowed: z.boolean(),
    repeatableNotes: z.string().optional(),
  })
  .superRefine(refineFeatPrerequisiteFields)

type FeatFormValues = z.infer<typeof featFormSchema>

function visibleWhenPrerequisite(...patterns: FeatPrerequisitePattern[]): FieldVisibility {
  return {
    dependsOn: ['prerequisitePattern'],
    visibleWhen: (watched) =>
      patterns.includes(watched['prerequisitePattern'] as FeatPrerequisitePattern),
  }
}

function visibleWhenRepeatableNotes(): FieldVisibility {
  return {
    dependsOn: ['repeatableAllowed'],
    visibleWhen: (watched) => watched['repeatableAllowed'] === true,
  }
}

const featFormDef: ContentFormDef<Feat, FeatFormValues, CreateFeatInput> = {
  routeKey: 'feats',
  schema: featFormSchema,
  coverage: 'structural',
  createDefaultValues: {
    category: 'general',
    prerequisitePattern: 'none',
    repeatableAllowed: false,
  },
  buildFields: (): FormItem[] => [
    { kind: 'group', legend: 'Identity', fields: identityFields() },
    {
      kind: 'group',
      legend: 'Classification',
      fields: [
        {
          type: 'chips',
          name: 'category',
          label: 'Category',
          options: featCategoryOptions,
          multiple: false,
          required: true,
          hint: FEAT_PART_ENTRIES.category.description,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Prerequisites',
      fields: [
        {
          type: 'select',
          name: 'prerequisitePattern',
          label: 'Prerequisite pattern',
          options: [...prerequisitePatternOptions],
          required: true,
          hint: FEAT_PART_ENTRIES.prerequisite.description,
        },
        {
          type: 'number',
          name: 'prerequisiteMinLevel',
          label: 'Minimum character level',
          min: 1,
          max: 20,
          visibility: visibleWhenPrerequisite(
            'min-level',
            'level-and-abilities',
            'level-and-spellcasting',
          ),
          required: true,
        },
        {
          type: 'text',
          name: 'prerequisiteFeatureId',
          label: 'Feature ID',
          hint: 'Kebab-case feature id, e.g. fighting-style',
          visibility: visibleWhenPrerequisite('feature'),
          required: true,
        },
        {
          type: 'chips',
          name: 'prerequisiteAbilities',
          label: 'Ability scores (OR)',
          options: abilityOptions,
          multiple: true,
          visibility: visibleWhenPrerequisite('level-and-abilities'),
          required: true,
        },
        {
          type: 'number',
          name: 'prerequisiteAbilityMinimum',
          label: 'Minimum score',
          min: ABILITY_SCORE_MIN,
          max: ABILITY_SCORE_MAX,
          visibility: visibleWhenPrerequisite('level-and-abilities'),
          required: true,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Repeatable',
      fields: [
        {
          type: 'switch',
          name: 'repeatableAllowed',
          label: 'Repeatable',
          hint: FEAT_PART_ENTRIES.repeatable.description,
        },
        {
          type: 'richtext',
          name: 'repeatableNotes',
          label: 'Repeat constraints',
          visibility: visibleWhenRepeatableNotes(),
        },
      ],
    },
  ],
  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    category: entity.category,
    ...prerequisiteToFormValues(entity.prerequisite),
    repeatableAllowed: entity.repeatable.allowed,
    repeatableNotes: entity.repeatable.notes,
  }),
  toInput: (values, ctx?: ContentFormInputCtx<Feat>) => {
    const prerequisite = prerequisiteFromFormValues(values)
    const repeatable = values.repeatableAllowed
      ? {
          allowed: true as const,
          notes: values.repeatableNotes?.trim() || undefined,
        }
      : { allowed: false as const }

    const input = createFeatInputSchema.parse({
      slug: slugForInputParse(values.name, ctx),
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      prerequisite,
      repeatable,
    })
    return finalizeContentInput(input, ctx) as CreateFeatInput
  },
  useListQuery: useFeats,
  queryKey: featsQueryKey,
}

contentFormRegistry['feats'] = featFormDef

export { featFormDef, featFormSchema }
export type { FeatFormValues }
