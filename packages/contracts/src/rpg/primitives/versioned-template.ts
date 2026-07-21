import { z } from 'zod'

import { authoredContentBodySchema } from './authored-content'

/** Release version for a shipped template. Schema evolution follows the codebase. */
export const templateVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/)

export type TemplateVersion = z.infer<typeof templateVersionSchema>

/** Immutable reference recorded by consumers of a shipped template release. */
export const versionedTemplateReferenceSchema = z.object({
  id: z.string().min(1),
  version: templateVersionSchema,
})

export type VersionedTemplateReference = z.infer<typeof versionedTemplateReferenceSchema>

/**
 * Shared discovery and release metadata for immutable, shipped templates.
 *
 * `id` is the stable reference key. `slug` is presentation-safe and may be used
 * in routes. `version` changes when the template's authored defaults change.
 */
export const versionedTemplateMetadataSchema = authoredContentBodySchema.extend({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  version: templateVersionSchema,
})

export type VersionedTemplateMetadata = z.infer<typeof versionedTemplateMetadataSchema>
