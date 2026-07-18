import type { NameCollectionId } from './collection'
import type { NameStructureDefinition } from './name-structure'
import type { NamingAssociation } from './naming-association'
import type { NamingConventionPartBinding } from './naming-convention'
import type { NameCollectionProvenance } from './provenance'
import type { NameSubjectKind } from './subject-kind'

// ---------------------------------------------------------------------------
// Naming convention definitions — slim catalog-bound shapes resolved at runtime.
// ---------------------------------------------------------------------------

export const NAMING_CONVENTION_KEYS = ['personal', 'settlement', 'clan'] as const

export type NamingConventionKey = (typeof NAMING_CONVENTION_KEYS)[number]

export type NamingConventionDefinition = {
  key: NamingConventionKey
  /** Explicit stable id when the derived id would break existing references. */
  id?: string
  /** Preserve when copy carries meaning beyond the generated default. */
  label?: string
  description?: string
  /** Required for multi-kind grammars; otherwise inferred from key. */
  subjectKinds?: readonly NameSubjectKind[]
  /** Exceptional associations only — culture and language are injected at resolve time. */
  associations?: readonly NamingAssociation[]
  structures: readonly NameStructureDefinition[]
  partBindings: readonly NamingConventionPartBinding[]
  collectionIds: readonly NameCollectionId[]
  provenance: NameCollectionProvenance
  tags?: readonly string[]
  version: number
}
