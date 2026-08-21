import { z } from 'zod'
import { type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { HERITAGE_NAME_HINT } from './species-heritage-form-labels'
import { traitRowDraftFormSchema, traitRowFormSchema } from './species-trait-form-fields'

export const heritageFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  choose: z.coerce.number().int().min(1).default(1),
  options: z.array(traitRowFormSchema).min(1),
})

/** Draft heritage form — options and grants may be incomplete while authoring. */
export const heritageDraftFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string(),
  description: z.string().optional(),
  choose: z.coerce.number().int().min(1).default(1),
  options: z.array(traitRowDraftFormSchema).default([]),
})

export type HeritageForm = z.infer<typeof heritageFormSchema>

export function heritageScalarFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'text',
      name: 'name',
      label: 'Name',
      required: true,
      hint: HERITAGE_NAME_HINT,
    },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
    },
  ]
}
