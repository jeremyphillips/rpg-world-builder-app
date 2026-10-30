import type { CatalogLayer } from '../../vocab/catalog-layer'
import type { SystemRulesetId } from '../ruleset'
import type { ContentProvenance } from './content-provenance'
import type { SourceDocumentId } from './source-document-registry'
import { listRulesetSourceDocumentIds } from './source-document-registry'

export function resolveContentSourceDocumentIds(args: {
  catalogLayer: CatalogLayer
  rulesetId: SystemRulesetId
  provenance?: ContentProvenance | null
}): readonly SourceDocumentId[] {
  if (args.catalogLayer === 'system') {
    return listRulesetSourceDocumentIds(args.rulesetId)
  }

  const documents = args.provenance?.documents
  if (!documents?.length) return []

  const ids = new Set<SourceDocumentId>()
  for (const entry of documents) {
    ids.add(entry.citation.documentId)
  }
  return [...ids]
}
