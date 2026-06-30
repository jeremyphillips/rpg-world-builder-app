import { z } from 'zod'
import { slugSchema } from '@rpg/contracts'
import { type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
import { classFeatureItemFields, featureRowFormSchema } from '../class-feature-form-fields'

export const subclassFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  features: z.array(featureRowFormSchema),
})

export type SubclassFormValues = z.infer<typeof subclassFormSchema>

export function buildSubclassFields(
  ctx: ContentFormCtx,
  options?: { defaultFeatureLevel?: number },
): FormItem[] {
  return [
    { type: 'text', name: 'name', label: 'Name', required: true },
    {
      type: 'text',
      name: 'tagline',
      label: 'Tagline',
      hint: 'Short italic lead-in shown under the name',
    },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
    },
    {
      kind: 'array',
      name: 'features',
      legend: 'Features',
      addLabel: 'Add feature',
      itemTitle: (values, index) => (values['name'] as string) || `Feature ${index + 1}`,
      fields: classFeatureItemFields(ctx, options),
    },
  ]
}
