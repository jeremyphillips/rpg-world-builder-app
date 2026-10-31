import { z } from 'zod'

import { sourceDocumentIdSchema } from './source-document-registry'

export const sourceLocatorSchema = z.object({
  section: z.string().min(1).optional(),
  page: z.number().int().min(1).optional(),
})

export type SourceLocator = z.infer<typeof sourceLocatorSchema>

/** Attribution and location only. Valid for every document, including reference-only ones. */
export const sourceCitationSchema = z.object({
  documentId: sourceDocumentIdSchema,
  locator: sourceLocatorSchema.optional(),
})

export type SourceCitation = z.infer<typeof sourceCitationSchema>
