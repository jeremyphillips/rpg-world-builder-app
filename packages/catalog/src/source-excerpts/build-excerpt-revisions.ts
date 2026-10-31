import {
  sourceExcerptRevisionSchema,
  type SourceDocumentId,
  type SourceExcerptRevision,
} from '@rpg/contracts'

export type CaptureSourceExcerptInput = {
  documentId: SourceDocumentId
  capturedAt: string
  transcription: SourceExcerptRevision['transcription']
  excerpts: readonly {
    excerptId: string
    text: string
    locator?: SourceExcerptRevision['locator']
  }[]
}

/** Builds revision 1 records from a capture input. Text is stored as supplied after schema parse. */
export function buildExcerptRevisions(input: CaptureSourceExcerptInput): SourceExcerptRevision[] {
  return input.excerpts.map((excerpt) =>
    sourceExcerptRevisionSchema.parse({
      documentId: input.documentId,
      excerptId: excerpt.excerptId,
      revision: 1,
      ...(excerpt.locator ? { locator: excerpt.locator } : {}),
      text: excerpt.text,
      transcription: input.transcription,
      capturedAt: input.capturedAt,
    }),
  )
}
