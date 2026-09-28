import { contentMediaSchema } from '@rpg/contracts'
import { z, type ZodType } from 'zod'

/** Spread into publish/draft `z.object({ … })` roots so submit validation retains `media`. */
export const managedContentMediaFormFields = {
  media: contentMediaSchema.optional(),
} as const

/** Extends plain object schemas; falls back to intersection for unions/preprocess wrappers. */
export function withManagedContentMediaFormSchema<T extends ZodType>(schema: T): T {
  if (schema instanceof z.ZodObject) {
    return schema.extend(managedContentMediaFormFields) as unknown as T
  }
  return schema.and(z.object(managedContentMediaFormFields)) as unknown as T
}
