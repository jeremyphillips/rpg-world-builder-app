import { z } from 'zod'
import {
  slugSchema,
  type CreateSubclassInput,
  type Subclass,
  type SubclassFeature,
} from '@rpg/contracts'
import { type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx, ContentFormInputCtx } from '../../lib/content-form-registry'
import { envelopeSlugFields, finalizeContentInput } from '../../lib/content-form-key-helpers'
import {
  classFeatureItemFields,
  featureRowFormSchema,
  featuresFromFormValues,
  featureToFormRow,
} from './class-feature-form-fields'

const subclassFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema.optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  features: z.array(featureRowFormSchema),
})

export type SubclassFormValues = z.infer<typeof subclassFormSchema>

export function subclassCreateDefaultValues(defaultFeatureLevel?: number): SubclassFormValues {
  return {
    name: '',
    tagline: '',
    description: '',
    features: [],
    ...(defaultFeatureLevel !== undefined ? {} : {}),
  }
}

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

export const subclassFormDef = {
  schema: subclassFormSchema,

  toFormValues: (entity: Subclass): SubclassFormValues => ({
    name: entity.name,
    slug: entity.slug,
    tagline: entity.tagline ?? '',
    description: entity.description ?? '',
    features: entity.features.map(featureToFormRow),
  }),

  toInput: (
    values: SubclassFormValues,
    classId: string,
    ctx?: ContentFormInputCtx<Subclass>,
  ): CreateSubclassInput =>
    finalizeContentInput(
      {
        ...envelopeSlugFields(values.name, ctx),
        classId,
        name: values.name,
        tagline: values.tagline || undefined,
        description: values.description || undefined,
        features: featuresFromFormValues(
          values.features,
          ctx?.entity?.features,
        ) as SubclassFeature[],
      },
      ctx,
    ) as CreateSubclassInput,
}

export { subclassFormSchema }
