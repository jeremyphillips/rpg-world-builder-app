import type { ApiContentTypeKey } from '../../primitives/content/content-type-keys'
import type { SystemRulesetId } from '../../primitives/ruleset'
import {
  contentProvenanceSchema,
  type ContentProvenance,
  documentAttributionSchema,
} from '../../primitives/provenance'
import type { CatalogLayer } from '../../vocab/catalog-layer'
import { listRulesetSourceDocumentIds } from '../../primitives/provenance/source-document-registry'

export type ContentProvenanceWriteAuthority = 'preserve' | 'carry' | 'initialize'

export class ContentProvenanceWriteError extends Error {
  readonly code: 'provenance_forbidden'

  constructor(code: ContentProvenanceWriteError['code'], message: string) {
    super(message)
    this.name = 'ContentProvenanceWriteError'
    this.code = code
  }
}

function provenanceEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function defaultDocumentsForRuleset(rulesetId: SystemRulesetId) {
  return listRulesetSourceDocumentIds(rulesetId).map((documentId) =>
    documentAttributionSchema.parse({
      kind: 'registered',
      citation: { documentId },
    }),
  )
}

function documentsForDuplicate(
  source: Record<string, unknown>,
): ContentProvenance['documents'] | undefined {
  const sourceCatalogLayer = source.catalogLayer as CatalogLayer
  const sourceProvenance = source.provenance as ContentProvenance | undefined

  if (sourceCatalogLayer === 'system') {
    return defaultDocumentsForRuleset(source.rulesetId as SystemRulesetId)
  }

  if (sourceProvenance?.documents?.length) return sourceProvenance.documents
  return undefined
}

function buildDuplicateProvenance(args: {
  source: Record<string, unknown>
  contentTypeKey: ApiContentTypeKey
  at: string
}): ContentProvenance {
  const sourceCatalogLayer = args.source.catalogLayer as CatalogLayer
  const sourceId = String(args.source.id)
  const sourceProvenance = args.source.provenance as ContentProvenance | undefined
  const documents = documentsForDuplicate(args.source)

  const next: ContentProvenance = {
    ...(documents ? { documents } : {}),
    derivedFrom: {
      relation: 'duplicate',
      contentId: sourceId,
      contentTypeKey: args.contentTypeKey,
      catalogLayer: sourceCatalogLayer,
      at: args.at,
    },
  }

  if (sourceProvenance?.citation) next.citation = sourceProvenance.citation
  if (sourceProvenance?.excerpt) next.excerpt = sourceProvenance.excerpt

  return contentProvenanceSchema.parse(next)
}

/**
 * Reconciles record-level provenance on a normalized write payload.
 * Entry-level hosts are handled in P2.
 */
function reconcileInitializedProvenance(
  normalized: Record<string, unknown>,
): Record<string, unknown> {
  if (normalized.provenance === undefined) return normalized
  contentProvenanceSchema.parse(normalized.provenance)
  return normalized
}

function reconcileCarriedProvenance(args: {
  normalized: Record<string, unknown>
  contentTypeKey?: ApiContentTypeKey
  provenanceSource?: Record<string, unknown>
  now?: string
}): Record<string, unknown> {
  if (!args.provenanceSource || !args.contentTypeKey) {
    throw new ContentProvenanceWriteError(
      'provenance_forbidden',
      'Duplicate provenance carry requires a source entity and content type.',
    )
  }
  return {
    ...args.normalized,
    provenance: buildDuplicateProvenance({
      source: args.provenanceSource,
      contentTypeKey: args.contentTypeKey,
      at: args.now ?? new Date().toISOString(),
    }),
  }
}

function reconcilePreservedProvenance(
  normalized: Record<string, unknown>,
  existing: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const incoming = normalized.provenance
  if (incoming !== undefined) {
    const stored = existing?.provenance
    if (stored !== undefined && provenanceEqual(incoming, stored)) return normalized
    throw new ContentProvenanceWriteError(
      'provenance_forbidden',
      'Record provenance is server-owned and cannot be supplied by clients.',
    )
  }
  if (existing?.provenance === undefined) return normalized
  return { ...normalized, provenance: existing.provenance }
}

export function reconcileContentProvenance(args: {
  authority: ContentProvenanceWriteAuthority
  catalogLayer: CatalogLayer
  rulesetId: SystemRulesetId
  contentTypeKey?: ApiContentTypeKey
  normalized: Record<string, unknown>
  existing?: Record<string, unknown>
  provenanceSource?: Record<string, unknown>
  now?: string
}): Record<string, unknown> {
  if (args.authority === 'initialize') return reconcileInitializedProvenance(args.normalized)
  if (args.authority === 'carry') return reconcileCarriedProvenance(args)
  return reconcilePreservedProvenance(args.normalized, args.existing)
}
