import { z } from 'zod'
import { slugSchema } from '@rpg/contracts'
import { type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { formatFeatureRowSummary, subclassFeatureItemFields } from '../class-feature-form-fields'
import {
  createSubclassFeatureRowFormSchema,
  type SubclassFeatureRowForm,
} from '../class-feature-row-form-schema'
import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../class-feature-form-labels'
import { vocabularyFieldLabel } from '@/features/vocabulary'

export function createSubclassFormSchema() {
  return z.object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    features: z.array(createSubclassFeatureRowFormSchema()),
  })
}

export type SubclassFormValues = z.infer<ReturnType<typeof createSubclassFormSchema>>

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
      heading: {
        label: vocabularyFieldLabel(CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN, { plural: true }),
      },
      addAction: { label: 'Add feature' },
      item: {
        collapsible: true,
        header: {
          fallback: (index) => `Feature ${index + 1}`,
          primaryField: 'name',
          summary: (values) => formatFeatureRowSummary(values as SubclassFeatureRowForm),
        },
      },
      fields: subclassFeatureItemFields(ctx, options),
    },
  ]
}
