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
  levelSchema,
  slugSchema,
  type CreateFeatInput,
  type Feat,
  type RequirementExpression,
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

export const FEAT_PREREQUISITE_PATTERNS = [
  'none',
  'min-level',
  'feature',
  'level-and-abilities',
  'level-and-spellcasting',
] as const

export type FeatPrerequisitePattern = (typeof FEAT_PREREQUISITE_PATTERNS)[number]

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
  .superRefine((values, ctx) => {
    if (!values.repeatableAllowed && values.repeatableNotes?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Repeat constraints are only allowed when the feat is repeatable',
        path: ['repeatableNotes'],
      })
    }

    switch (values.prerequisitePattern) {
      case 'none':
        return
      case 'min-level':
        if (!levelSchema.safeParse(values.prerequisiteMinLevel).success) {
          ctx.addIssue({
            code: 'custom',
            message: 'Minimum character level is required',
            path: ['prerequisiteMinLevel'],
          })
        }
        return
      case 'feature':
        if (!values.prerequisiteFeatureId?.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: 'Feature ID is required',
            path: ['prerequisiteFeatureId'],
          })
        }
        return
      case 'level-and-abilities':
        if (!levelSchema.safeParse(values.prerequisiteMinLevel).success) {
          ctx.addIssue({
            code: 'custom',
            message: 'Minimum character level is required',
            path: ['prerequisiteMinLevel'],
          })
        }
        if (!values.prerequisiteAbilities?.length) {
          ctx.addIssue({
            code: 'custom',
            message: 'Select at least one ability score',
            path: ['prerequisiteAbilities'],
          })
        }
        if (
          values.prerequisiteAbilityMinimum === undefined ||
          values.prerequisiteAbilityMinimum < ABILITY_SCORE_MIN ||
          values.prerequisiteAbilityMinimum > ABILITY_SCORE_MAX
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `Minimum score must be between ${ABILITY_SCORE_MIN} and ${ABILITY_SCORE_MAX}`,
            path: ['prerequisiteAbilityMinimum'],
          })
        }
        return
      case 'level-and-spellcasting':
        if (!levelSchema.safeParse(values.prerequisiteMinLevel).success) {
          ctx.addIssue({
            code: 'custom',
            message: 'Minimum character level is required',
            path: ['prerequisiteMinLevel'],
          })
        }
    }
  })

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

/** Maps validated form prerequisite fields to a RequirementExpression tree. */
export function prerequisiteFromFormValues(
  values: Pick<
    FeatFormValues,
    | 'prerequisitePattern'
    | 'prerequisiteMinLevel'
    | 'prerequisiteFeatureId'
    | 'prerequisiteAbilities'
    | 'prerequisiteAbilityMinimum'
  >,
): RequirementExpression | undefined {
  switch (values.prerequisitePattern) {
    case 'none':
      return undefined
    case 'min-level':
      return { kind: 'minLevel', level: levelSchema.parse(values.prerequisiteMinLevel) }
    case 'feature':
      return { kind: 'feature', featureId: values.prerequisiteFeatureId!.trim() }
    case 'level-and-abilities':
      return {
        kind: 'all',
        requirements: [
          { kind: 'minLevel', level: levelSchema.parse(values.prerequisiteMinLevel) },
          {
            kind: 'any',
            requirements: values.prerequisiteAbilities!.map((ability) => ({
              kind: 'abilityMinimum' as const,
              ability,
              minimum: values.prerequisiteAbilityMinimum!,
            })),
          },
        ],
      }
    case 'level-and-spellcasting':
      return {
        kind: 'all',
        requirements: [
          { kind: 'minLevel', level: levelSchema.parse(values.prerequisiteMinLevel) },
          { kind: 'spellcasting' },
        ],
      }
  }
}

/** Maps a stored prerequisite tree to form fields for the v1 pattern editor. */
export function prerequisiteToFormValues(
  prerequisite?: RequirementExpression,
): Pick<
  FeatFormValues,
  | 'prerequisitePattern'
  | 'prerequisiteMinLevel'
  | 'prerequisiteFeatureId'
  | 'prerequisiteAbilities'
  | 'prerequisiteAbilityMinimum'
> {
  if (!prerequisite) {
    return { prerequisitePattern: 'none' }
  }

  if (prerequisite.kind === 'minLevel') {
    return {
      prerequisitePattern: 'min-level',
      prerequisiteMinLevel: prerequisite.level,
    }
  }

  if (prerequisite.kind === 'feature') {
    return {
      prerequisitePattern: 'feature',
      prerequisiteFeatureId: prerequisite.featureId,
    }
  }

  if (prerequisite.kind === 'all' && prerequisite.requirements.length === 2) {
    const [first, second] = prerequisite.requirements

    if (first?.kind === 'minLevel' && second?.kind === 'spellcasting') {
      return {
        prerequisitePattern: 'level-and-spellcasting',
        prerequisiteMinLevel: first.level,
      }
    }

    if (first?.kind === 'minLevel' && second?.kind === 'any') {
      const abilityMins = second.requirements.filter((req) => req.kind === 'abilityMinimum')
      if (abilityMins.length > 0) {
        const minimum = abilityMins[0]!.minimum
        if (abilityMins.every((req) => req.minimum === minimum)) {
          return {
            prerequisitePattern: 'level-and-abilities',
            prerequisiteMinLevel: first.level,
            prerequisiteAbilities: abilityMins.map((req) => req.ability),
            prerequisiteAbilityMinimum: minimum,
          }
        }
      }
    }
  }

  return { prerequisitePattern: 'none' }
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
