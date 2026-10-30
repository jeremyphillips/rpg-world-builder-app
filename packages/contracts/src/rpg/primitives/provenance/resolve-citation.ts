import type { SourceCitation } from './source-citation'
import {
  getRegisteredSourceDocument,
  type SourceDocumentEntry,
  type SourceDocumentId,
} from './source-document-registry'

export type ResolvedSourceCitation = {
  document: SourceDocumentEntry
  documentId: SourceDocumentId
  locator: SourceCitation['locator']
}

export function resolveCitation(citation: SourceCitation): ResolvedSourceCitation {
  const document = getRegisteredSourceDocument(citation.documentId)
  return {
    document,
    documentId: citation.documentId,
    locator: citation.locator,
  }
}
