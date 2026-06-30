import { type CreateSubclassInput, type Subclass, type SubclassFeature } from '@rpg/contracts'

import {
  envelopeSlugFields,
  finalizeContentInput,
} from '../../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../../lib/forms/content-form-registry'
import { featuresFromFormValues, featureToFormRow } from '../class-feature-form-fields'
import { subclassFormSchema, type SubclassFormValues } from './subclass-form-fields'

export function subclassCreateDefaultValues(defaultFeatureLevel?: number): SubclassFormValues {
  return {
    name: '',
    tagline: '',
    description: '',
    features: [],
    ...(defaultFeatureLevel !== undefined ? {} : {}),
  }
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
