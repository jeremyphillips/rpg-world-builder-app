import { createElement } from 'react'
import { z } from 'zod'
import {
  FEAT_CATEGORY_ENTRIES,
  FEAT_CATEGORY_IDS,
  FEAT_PART_ENTRIES,
  createFeatInputSchema,
  slugSchema,
  type CreateFeatInput,
  type Feat,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { RequirementEditor } from '../../components/requirement-editor.client'
import { identityFields } from '../../lib/content-form-field-helpers'
import {
  contentFormRegistry,
  type ContentFormDef,
  type ContentFormInputCtx,
} from '../../lib/content-form-registry'
import { finalizeContentInput, slugForInputParse } from '../../lib/content-form-key-helpers'
import {
  prerequisiteEditorSchema,
  requirementEditorDefaultValue,
  requirementEditorToExpression,
  requirementExpressionToEditor,
  refineRequirementEditor,
} from '../../lib/requirement-editor-form'
import { useFeats, featsQueryKey } from '../hooks/use-feats'

const featCategoryOptions = toOptions(
  FEAT_CATEGORY_IDS,
  Object.fromEntries(
    FEAT_CATEGORY_IDS.map((id) => [id, FEAT_CATEGORY_ENTRIES[id].label]),
  ) as Record<(typeof FEAT_CATEGORY_IDS)[number], string>,
)

const featFormSchema = z
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
    refineRequirementEditor(values.prerequisiteEditor, ctx)
    if (!values.repeatableAllowed && values.repeatableNotes?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Repeat constraints are only allowed when the feat is repeatable',
        path: ['repeatableNotes'],
      })
    }
  })

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
  coverage: 'structural',
  createDefaultValues: {
    category: 'general',
    prerequisiteEditor: requirementEditorDefaultValue(),
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
      kind: 'slot',
      name: 'prerequisiteEditor',
      label: 'Prerequisites',
      hint: FEAT_PART_ENTRIES.prerequisite.description,
      render: () => createElement(RequirementEditor, { name: 'prerequisiteEditor' }),
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
    prerequisiteEditor: requirementExpressionToEditor(entity.prerequisite),
    repeatableAllowed: entity.repeatable.allowed,
    repeatableNotes: entity.repeatable.notes,
  }),
  toInput: (values, ctx?: ContentFormInputCtx<Feat>) => {
    const prerequisite = requirementEditorToExpression(values.prerequisiteEditor)
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
