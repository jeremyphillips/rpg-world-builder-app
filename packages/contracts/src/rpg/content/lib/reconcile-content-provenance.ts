import type { ApiContentTypeKey } from '../../primitives/content/content-type-keys'
import type { SystemRulesetId } from '../../primitives/ruleset'
import { canonicalJson } from '../../primitives/provenance/canonical-json'
import {
  contentProvenanceSchema,
  entryProvenanceSchema,
  type ContentProvenance,
  type EntryProvenance,
  type SourceExcerptRef,
  documentAttributionSchema,
} from '../../primitives/provenance'
import type { CatalogLayer } from '../../vocab/catalog-layer'
import {
  getRegisteredSourceDocument,
  listRulesetSourceDocumentIds,
} from '../../primitives/provenance/source-document-registry'
import { resolveContentSourceDocumentIds } from '../../primitives/provenance/resolve-content-source-documents'
import {
  provenanceEntryHostsFor,
  readProvenanceHostEntries,
  writeProvenanceHostEntries,
  type ProvenanceEntryHostPath,
} from './content-type-capabilities'

export type ContentProvenanceWriteAuthority = 'preserve' | 'carry' | 'initialize'

export class ContentProvenanceWriteError extends Error {
  readonly code: 'provenance_forbidden' | 'provenance_reassignment' | 'provenance_invalid'

  constructor(code: ContentProvenanceWriteError['code'], message: string) {
    super(message)
    this.name = 'ContentProvenanceWriteError'
    this.code = code
  }
}

function provenanceEqual(a: unknown, b: unknown): boolean {
  return canonicalJson(a) === canonicalJson(b)
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

function isEntry(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function entryId(entry: Record<string, unknown>): string | undefined {
  return typeof entry.id === 'string' ? entry.id : undefined
}

function omitEntryProvenance(entry: Record<string, unknown>): Record<string, unknown> {
  const { provenance: _provenance, ...rest } = entry
  return rest
}

function hostsFor(
  contentTypeKey: ApiContentTypeKey | undefined,
): readonly ProvenanceEntryHostPath[] {
  return contentTypeKey ? provenanceEntryHostsFor(contentTypeKey) : []
}

function storedProvenanceById(
  existing: Record<string, unknown> | undefined,
  hosts: readonly ProvenanceEntryHostPath[],
): Map<string, unknown> {
  const stored = new Map<string, unknown>()
  if (!existing) return stored
  for (const host of hosts) {
    const entries = readProvenanceHostEntries(existing, host)
    if (!Array.isArray(entries)) continue
    for (const entry of entries) {
      if (!isEntry(entry)) continue
      const id = entryId(entry)
      if (id && entry.provenance !== undefined) stored.set(id, entry.provenance)
    }
  }
  return stored
}

function hostIsPresent(body: Record<string, unknown>, host: ProvenanceEntryHostPath): boolean {
  return Object.prototype.hasOwnProperty.call(body, host)
}

/** Drops record and entry provenance so a system patch cannot store it. */
export function stripContentProvenanceForPatch(
  body: Record<string, unknown>,
  contentTypeKey: ApiContentTypeKey,
): Record<string, unknown> {
  const { provenance: _provenance, ...rest } = body
  let next: Record<string, unknown> = rest
  for (const host of hostsFor(contentTypeKey)) {
    if (!hostIsPresent(body, host)) continue
    const entries = readProvenanceHostEntries(body, host)
    if (!Array.isArray(entries)) continue
    next = writeProvenanceHostEntries(
      next,
      host,
      entries.map((entry) => (isEntry(entry) ? omitEntryProvenance(entry) : entry)),
    )
  }
  return next
}

function reattachSystemEntries(
  normalized: Record<string, unknown>,
  existing: Record<string, unknown> | undefined,
  hosts: readonly ProvenanceEntryHostPath[],
): Record<string, unknown> {
  const stored = storedProvenanceById(existing, hosts)
  let next = { ...normalized }
  if (existing?.provenance !== undefined) next.provenance = existing.provenance
  else delete next.provenance

  for (const host of hosts) {
    if (!hostIsPresent(normalized, host)) continue
    const entries = readProvenanceHostEntries(normalized, host)
    if (!Array.isArray(entries)) continue
    next = writeProvenanceHostEntries(
      next,
      host,
      entries.map((entry) => {
        if (!isEntry(entry)) return entry
        const id = entryId(entry)
        const provenance = id ? stored.get(id) : undefined
        if (provenance === undefined) return omitEntryProvenance(entry)
        return { ...entry, provenance }
      }),
    )
  }
  return next
}

function reconcilePreservedEntries(
  normalized: Record<string, unknown>,
  existing: Record<string, unknown> | undefined,
  hosts: readonly ProvenanceEntryHostPath[],
): Record<string, unknown> {
  const stored = storedProvenanceById(existing, hosts)
  let next = normalized
  for (const host of hosts) {
    if (!hostIsPresent(normalized, host)) continue
    const entries = readProvenanceHostEntries(normalized, host)
    if (!Array.isArray(entries)) continue
    next = writeProvenanceHostEntries(
      next,
      host,
      entries.map((entry) => {
        if (!isEntry(entry)) return entry
        const id = entryId(entry)
        const storedProvenance = id ? stored.get(id) : undefined
        if (entry.provenance === undefined) {
          if (storedProvenance === undefined) return entry
          return { ...entry, provenance: storedProvenance }
        }
        if (storedProvenance !== undefined && provenanceEqual(entry.provenance, storedProvenance)) {
          return entry
        }
        throw new ContentProvenanceWriteError(
          'provenance_reassignment',
          'Entry provenance is server-owned and cannot be added, replaced, or moved.',
        )
      }),
    )
  }
  return next
}

function requireSourceDocument(documentId: string, allowed: ReadonlySet<string>): void {
  if (!allowed.has(documentId)) {
    throw new ContentProvenanceWriteError(
      'provenance_invalid',
      `Document ${documentId} is not a source for this record.`,
    )
  }
}

function requireExcerpt(
  ref: SourceExcerptRef,
  allowed: ReadonlySet<string>,
  excerptExists: ((ref: SourceExcerptRef) => boolean) | undefined,
): void {
  requireSourceDocument(ref.documentId, allowed)
  if (!getRegisteredSourceDocument(ref.documentId).access.storeText) {
    throw new ContentProvenanceWriteError(
      'provenance_invalid',
      'Reference-only documents cannot be cited as excerpts.',
    )
  }
  if (!excerptExists) {
    throw new ContentProvenanceWriteError(
      'provenance_invalid',
      'Excerpt references require an excerpt store check.',
    )
  }
  if (!excerptExists(ref)) {
    throw new ContentProvenanceWriteError(
      'provenance_invalid',
      `Excerpt ${ref.excerptId} does not exist.`,
    )
  }
}

function assertEntryProvenanceIntegrity(
  provenance: EntryProvenance,
  allowed: ReadonlySet<string>,
  excerptExists: ((ref: SourceExcerptRef) => boolean) | undefined,
): void {
  if (provenance.citation) requireSourceDocument(provenance.citation.documentId, allowed)
  if (provenance.excerpt) requireExcerpt(provenance.excerpt, allowed, excerptExists)
}

function readRecordProvenance(normalized: Record<string, unknown>): ContentProvenance | undefined {
  if (normalized.provenance === undefined) return undefined
  return contentProvenanceSchema.parse(normalized.provenance)
}

function assertRecordProvenanceIntegrity(
  provenance: ContentProvenance | undefined,
  allowed: ReadonlySet<string>,
  excerptExists: ((ref: SourceExcerptRef) => boolean) | undefined,
): void {
  if (!provenance) return
  for (const document of provenance.documents ?? []) {
    requireSourceDocument(document.citation.documentId, allowed)
  }
  if (provenance.citation) requireSourceDocument(provenance.citation.documentId, allowed)
  if (provenance.excerpt) requireExcerpt(provenance.excerpt, allowed, excerptExists)
}

function assertHostEntryIntegrity(
  entries: unknown,
  allowed: ReadonlySet<string>,
  excerptExists: ((ref: SourceExcerptRef) => boolean) | undefined,
): void {
  if (!Array.isArray(entries)) return
  for (const entry of entries) {
    if (!isEntry(entry) || entry.provenance === undefined) continue
    assertEntryProvenanceIntegrity(
      entryProvenanceSchema.parse(entry.provenance),
      allowed,
      excerptExists,
    )
  }
}

function assertInitializeIntegrity(args: {
  catalogLayer: CatalogLayer
  rulesetId: SystemRulesetId
  normalized: Record<string, unknown>
  hosts: readonly ProvenanceEntryHostPath[]
  excerptExists?: (ref: SourceExcerptRef) => boolean
}): void {
  const provenance = readRecordProvenance(args.normalized)
  const allowed = new Set(
    resolveContentSourceDocumentIds({
      catalogLayer: args.catalogLayer,
      rulesetId: args.rulesetId,
      provenance,
    }),
  )
  assertRecordProvenanceIntegrity(provenance, allowed, args.excerptExists)
  for (const host of args.hosts) {
    assertHostEntryIntegrity(
      readProvenanceHostEntries(args.normalized, host),
      allowed,
      args.excerptExists,
    )
  }
}

function reconcileInitializedEntries(
  normalized: Record<string, unknown>,
  hosts: readonly ProvenanceEntryHostPath[],
): Record<string, unknown> {
  for (const host of hosts) {
    const entries = readProvenanceHostEntries(normalized, host)
    if (!Array.isArray(entries)) continue
    for (const entry of entries) {
      if (isEntry(entry) && entry.provenance !== undefined) {
        entryProvenanceSchema.parse(entry.provenance)
      }
    }
  }
  return normalized
}

/**
 * Reconciles record and entry provenance on a normalized write payload.
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
  /** Required when `initialize` sets excerpt references. */
  excerptExists?: (ref: SourceExcerptRef) => boolean
}): Record<string, unknown> {
  const hosts = hostsFor(args.contentTypeKey)
  if (args.authority === 'initialize') {
    const normalized = reconcileInitializedEntries(
      reconcileInitializedProvenance(args.normalized),
      hosts,
    )
    assertInitializeIntegrity({
      catalogLayer: args.catalogLayer,
      rulesetId: args.rulesetId,
      normalized,
      hosts,
      excerptExists: args.excerptExists,
    })
    return normalized
  }
  if (args.authority === 'carry') return reconcileCarriedProvenance(args)
  if (args.catalogLayer === 'system') {
    return reattachSystemEntries(args.normalized, args.existing, hosts)
  }
  return reconcilePreservedEntries(
    reconcilePreservedProvenance(args.normalized, args.existing),
    args.existing,
    hosts,
  )
}
