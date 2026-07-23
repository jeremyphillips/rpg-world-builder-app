import type { z } from 'zod'

import { contentMetaSchema } from './envelope'
import { slugSchema } from './envelope'

type ZodObjectSchema = z.ZodObject<z.ZodRawShape>

/** Homebrew create DTO for draft saves — body fields plus envelope slug. */
export function createDraftInputSchema<T extends ZodObjectSchema>(bodyDraft: T) {
  return bodyDraft.extend({ slug: slugSchema })
}

/** Homebrew create DTO for publish saves — alias for the publish-complete body + slug. */
export function createPublishInputSchema<T extends ZodObjectSchema>(bodyPublish: T) {
  return bodyPublish.extend({ slug: slugSchema })
}

/** Stored catalog record for draft entities — ownership envelope plus relaxed body. */
export function draftStoredSchema<T extends ZodObjectSchema>(bodyDraft: T) {
  return contentMetaSchema.extend(bodyDraft.shape)
}

/** Stored catalog record for published entities — ownership envelope plus full body. */
export function publishStoredSchema<T extends ZodObjectSchema>(bodyPublish: T) {
  return contentMetaSchema.extend(bodyPublish.shape)
}
