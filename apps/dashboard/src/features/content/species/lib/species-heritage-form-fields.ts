import { z } from 'zod'
import { type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  HERITAGE_GROUP_DESCRIPTION,
  HERITAGE_GROUP_LEGEND,
  HERITAGE_NAME_HINT,
} from './species-heritage-form-labels'
import { heritageOptionRowObjectSchema, refinePublishedTraitRow } from './species-trait-form-fields'

export const heritageOptionRowDraftFormSchema = heritageOptionRowObjectSchema()

export const heritageOptionRowFormSchema =
  heritageOptionRowDraftFormSchema.superRefine(refinePublishedTraitRow)

export type HeritageOptionRowForm = z.infer<typeof heritageOptionRowFormSchema>

export const heritageFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  choose: z.coerce.number().int().min(1).default(1),
  options: z.array(heritageOptionRowFormSchema).min(1),
})

/** Draft heritage form — options and grants may be incomplete while authoring. */
export const heritageDraftFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string(),
  description: z.string().optional(),
  choose: z.coerce.number().int().min(1).default(1),
  options: z.array(heritageOptionRowDraftFormSchema).default([]),
})

export type HeritageForm = z.infer<typeof heritageFormSchema>

export function heritageScalarFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'group',
      legend: HERITAGE_GROUP_LEGEND,
      description: HERITAGE_GROUP_DESCRIPTION,
      fields: [
        {
          kind: 'row',
          align: 'start',
          fields: [
            {
              type: 'text',
              name: 'name',
              label: 'Name',
              required: true,
              hint: { text: HERITAGE_NAME_HINT, position: 'below-control' },
              width: '1/2',
            },
            {
              type: 'richtext',
              name: 'description',
              label: 'Description',
              linkable: true,
              internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
              contentTypeOptions: ctx.options?.richTextContentTypeOptions,
              width: '1/2',
            },
          ],
        },
      ],
    },
  ]
}
