import { z } from 'zod'

import { sourceCitationSchema } from './source-citation'
import { getRegisteredSourceDocument, sourceDocumentIdSchema } from './source-document-registry'
import { contentLineageSchema } from './content-lineage'

const SOURCE_EXCERPT_ID_PATTERN = /^[a-z0-9-]+(?:\/[a-z0-9-]+)+$/

export const REFERENCE_ONLY_EXCERPT_MESSAGE =
  'Reference-only documents cannot be cited as excerpts.'

/** Excerpt ids are only valid for documents that permit stored text. */
export function createSourceExcerptRefSchema<T extends string>(
  documentIdSchema: z.ZodType<T>,
  accessFor: (documentId: T) => { storeText: boolean },
) {
  return z
    .object({
      documentId: documentIdSchema,
      excerptId: z.string().regex(SOURCE_EXCERPT_ID_PATTERN),
    })
    .superRefine((ref, ctx) => {
      if (!accessFor(ref.documentId).storeText) {
        ctx.addIssue({ code: 'custom', message: REFERENCE_ONLY_EXCERPT_MESSAGE })
      }
    })
}

/** Pointer to a captured passage. Rejected when the document cannot store text. */
export const sourceExcerptRefSchema = createSourceExcerptRefSchema(
  sourceDocumentIdSchema,
  (documentId) => getRegisteredSourceDocument(documentId).access,
)

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
