import { z } from 'zod'

import { sourceCitationSchema } from './source-citation'
import { sourceDocumentIdSchema } from './source-document-registry'
import { contentLineageSchema } from './content-lineage'

/** Pointer to a captured passage (P2). Schema-only in P1. */
export const sourceExcerptRefSchema = z.object({
  documentId: sourceDocumentIdSchema,
  excerptId: z.string().regex(/^[a-z0-9-]+(?:\/[a-z0-9-]+)+$/),
})

export type SourceExcerptRef = z.infer<typeof sourceExcerptRefSchema>

export const documentAttributionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('registered'), citation: sourceCitationSchema }),
])

export type DocumentAttribution = z.infer<typeof documentAttributionSchema>

/** Record-level. Server-owned; never an empty object. */
export const contentProvenanceSchema = z
  .object({
    documents: z.array(documentAttributionSchema).min(1).optional(),
    citation: sourceCitationSchema.optional(),
    excerpt: sourceExcerptRefSchema.optional(),
    derivedFrom: contentLineageSchema.optional(),
  })
  .refine((p) => Object.keys(p).length > 0)

export type ContentProvenance = z.infer<typeof contentProvenanceSchema>

/** Entry-level (opt-in hosts, P2). Exported for forward-compatible schemas. */
export const entryProvenanceSchema = z
  .object({ citation: sourceCitationSchema.optional(), excerpt: sourceExcerptRefSchema.optional() })
  .refine((p) => p.citation !== undefined || p.excerpt !== undefined)

export type EntryProvenance = z.infer<typeof entryProvenanceSchema>

export const entryProvenanceField = { provenance: entryProvenanceSchema.optional() } as const
