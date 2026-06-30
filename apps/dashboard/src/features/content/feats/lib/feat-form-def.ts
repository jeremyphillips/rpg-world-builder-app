import { createElement } from 'react'
import { z } from 'zod'
import {
  FEAT_CATEGORY_ENTRIES,
  FEAT_CATEGORY_IDS,
  FEAT_PART_ENTRIES,
  createFeatInputSchema,
  MAX_CHARACTER_LEVEL,
  slugSchema,
  type CreateFeatInput,
  type Feat,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { RequirementEditor } from '../components/requirement-editor.client'
import { identityFields } from '../../lib/forms/content-identity-form-fields'
import {
  contentFormRegistry,
  type ContentFormDef,
  type ContentFormInputCtx,
  type ContentFormCtx,
} from '../../lib/forms/content-form-registry'
import { finalizeContentInput, slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import { refineRequirementEditor } from './requirement-editor-form'
import {
  prerequisiteEditorSchema,
  requirementEditorDefaultValue,
} from './requirement-editor-form-schema'
import {
  requirementEditorToExpression,
  requirementExpressionToEditor,
} from './requirement-editor-form-values'
import { useFeats, featsQueryKey } from '../hooks/use-feats'

const featCategoryOptions = toOptions(
  FEAT_CATEGORY_IDS,
  Object.fromEntries(
    FEAT_CATEGORY_IDS.map((id) => [id, FEAT_CATEGORY_ENTRIES[id].label]),
  ) as Record<(typeof FEAT_CATEGORY_IDS)[number], string>,
)

function createFeatFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return z
    .object({
      name: z.string().min(1),
      slug: slugSchema.optional(),
      description: z.string().optional(),
      category: z.enum(FEAT_CATEGORY_IDS),
      prerequisiteEditor: prerequisiteEditorSchema,
      repeatableAllowed: z.boolean(),
      repeatableNotes: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      refineRequirementEditor(values.prerequisiteEditor, ctx, maxLevel)
      if (!values.repeatableAllowed && values.repeatableNotes?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Repeat constraints are only allowed when the feat is repeatable',
          path: ['repeatableNotes'],
        })
      }
    })
}

const featFormSchema = createFeatFormSchema()

type FeatFormValues = z.infer<typeof featFormSchema>

function visibleWhenRepeatableNotes(): FieldVisibility {
  return {
    dependsOn: ['repeatableAllowed'],
    visibleWhen: (watched) => watched['repeatableAllowed'] === true,
  }
}

const featFormDef: ContentFormDef<Feat, FeatFormValues, CreateFeatInput> = {
  routeKey: 'feats',
  schema: featFormSchema,
  resolveSchema: (ctx) =>
    createFeatFormSchema(ctx.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL),
  coverage: 'structural',
  createDefaultValues: {
    category: 'general',
    prerequisiteEditor: requirementEditorDefaultValue(),
    repeatableAllowed: false,
  },
  buildFields: (ctx: ContentFormCtx): FormItem[] => [
    { kind: 'group', legend: 'Identity', fields: identityFields(ctx) },
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
        },
      ],
    },
    {
      kind: 'slot',
      name: 'prerequisiteEditor',
      label: 'Prerequisites',
      render: () =>
        createElement(RequirementEditor, {
          name: 'prerequisiteEditor',
          maxCharacterLevel: ctx.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL,
        }),
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
          linkable: true,
          internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
          contentTypeOptions: ctx.options?.richTextContentTypeOptions,
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
    prerequisiteEditor: requirementExpressionToEditor(entity.prerequisite),
    repeatableAllowed: entity.repeatable.allowed,
    repeatableNotes: entity.repeatable.notes,
  }),
  toInput: (values, ctx?: ContentFormInputCtx<Feat>) => {
    const maxLevel = ctx?.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
    const prerequisite = requirementEditorToExpression(values.prerequisiteEditor, maxLevel)
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
