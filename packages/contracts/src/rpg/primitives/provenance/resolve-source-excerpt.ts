import type { CatalogLayer } from '../../vocab/catalog-layer'
import type { SystemRulesetId } from '../ruleset'
import type { ContentProvenance } from './content-provenance'
import type { SourceExcerptRef } from './content-provenance'
import type { SourceExcerptRevision } from './source-excerpt'
import { getRegisteredSourceDocument } from './source-document-registry'
import { resolveContentSourceDocumentIds } from './resolve-content-source-documents'

export type SourceExcerptViewer = {
  /** Campaign managers may read `display: 'managers'` text. Any viewer who can read the record may read `any-viewer` text. */
  isManager: boolean
  /** False when the record itself is hidden from this viewer, including lineage to a hidden source. */
  canReadRecord: boolean
}

export type SourceExcerptResolution =
  | {
      status: 'available'
      latest: SourceExcerptRevision
      history: readonly SourceExcerptRevision[]
    }
  | { status: 'missing' }
  | { status: 'restricted' }
  | { status: 'unavailable' }

function historyFor(
  revisions: readonly SourceExcerptRevision[],
  ref: SourceExcerptRef,
): SourceExcerptRevision[] {
  return revisions
    .filter(
      (revision) => revision.documentId === ref.documentId && revision.excerptId === ref.excerptId,
    )
    .sort((a, b) => a.revision - b.revision)
}

/**
 * Resolves a stored passage. Never substitutes canonical catalog text.
 * `revisions` is the caller's loaded store; this function does not read files.
 */
export function resolveSourceExcerpt(args: {
  ref: SourceExcerptRef
  revisions: readonly SourceExcerptRevision[]
  viewer: SourceExcerptViewer
  record: {
    catalogLayer: CatalogLayer
    rulesetId: SystemRulesetId
    provenance?: ContentProvenance | null
  }
}): SourceExcerptResolution {
  if (!args.viewer.canReadRecord) return { status: 'unavailable' }

  const allowed = resolveContentSourceDocumentIds(args.record)
  if (!allowed.includes(args.ref.documentId)) return { status: 'missing' }

  const document = getRegisteredSourceDocument(args.ref.documentId)
  if (!document.access.storeText) return { status: 'missing' }
  if (document.access.display === 'managers' && !args.viewer.isManager) {
    return { status: 'restricted' }
  }

  const history = historyFor(args.revisions, args.ref)
  const latest = history.at(-1)
  if (!latest) return { status: 'missing' }
  return { status: 'available', latest, history }
}
