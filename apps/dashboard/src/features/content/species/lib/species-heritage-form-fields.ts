import { z } from 'zod'
import { type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { HERITAGE_NAME_HINT } from './species-heritage-form-labels'
import { traitRowFormSchema } from './species-trait-form-fields'

export const heritageFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  choose: z.coerce.number().int().min(1).default(1),
  options: z.array(traitRowFormSchema).min(1),
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
