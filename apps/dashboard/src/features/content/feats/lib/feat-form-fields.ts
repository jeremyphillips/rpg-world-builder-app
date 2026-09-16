import { createElement } from 'react'
import { z } from 'zod'
import {
  FEAT_CATEGORY_ENTRIES,
  FEAT_CATEGORY_IDS,
  FEAT_PART_ENTRIES,
  MAX_CHARACTER_LEVEL,
  featValidationMessages,
  slugSchema,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { RequirementEditor } from '../components/requirement-editor'
import { descriptionField } from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { draftOptionalSelect } from '../../lib/forms/validation/draft-form-schema-helpers'
import { createPrerequisiteEditorSchema } from './requirement-editor-form'
import { prerequisiteEditorResolverFields } from './requirement-editor-resolver-fields'

const featCategoryOptions = toOptions(
  FEAT_CATEGORY_IDS,
  Object.fromEntries(
    FEAT_CATEGORY_IDS.map((id) => [id, FEAT_CATEGORY_ENTRIES[id].label]),
  ) as Record<(typeof FEAT_CATEGORY_IDS)[number], string>,
)

export function createFeatFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return z
    .object({
      name: z.string().min(1),
      slug: slugSchema.optional(),
      description: z.string().optional(),
      category: z.enum(FEAT_CATEGORY_IDS),
      prerequisiteEditor: createPrerequisiteEditorSchema(maxLevel),
      repeatableAllowed: z.boolean(),
      repeatableNotes: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (!values.repeatableAllowed && values.repeatableNotes?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: featValidationMessages.repeatableNotesOnlyWhenAllowed(),
          path: ['repeatableNotes'],
        })
      }
    })
}

export function createFeatDraftFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return z
    .object({
      name: z.string(),
      slug: slugSchema.optional(),
      description: z.string().optional(),
      category: draftOptionalSelect(z.enum(FEAT_CATEGORY_IDS)),
      prerequisiteEditor: createPrerequisiteEditorSchema(maxLevel),
      repeatableAllowed: z.boolean(),
      repeatableNotes: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (!values.repeatableAllowed && values.repeatableNotes?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: featValidationMessages.repeatableNotesOnlyWhenAllowed(),
          path: ['repeatableNotes'],
        })
      }
    })
}

export const featFormSchema = createFeatFormSchema()
export const featDraftFormSchema = createFeatDraftFormSchema()

export type FeatFormValues = z.infer<typeof featFormSchema>

function visibleWhenRepeatableNotes(): FieldVisibility {
  return {
    dependsOn: ['repeatableAllowed'],
    visibleWhen: (watched) => watched['repeatableAllowed'] === true,
  }
}

export function buildFeatFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'chips',
      name: 'category',
      label: 'Category',
      options: featCategoryOptions,
      multiple: false,
      required: true,
    },
    descriptionField(ctx),
    {
      kind: 'group',
      legend: 'Prerequisites',
      fields: [
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
      ],
    },
    {
      kind: 'group',
      visibility: {
        dependsOn: [],
        visibleWhen: () => false,
      },
      fields: prerequisiteEditorResolverFields(),
    },
    {
      kind: 'group',
      legend: '',
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
  ]
}
