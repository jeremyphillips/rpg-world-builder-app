import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { resolveMasterDetailSourceLabel } from './resolve-master-detail-source-label'

export type MasterDetailProvenance = 'system' | 'homebrew'
export type MasterDetailPersistence = 'new' | 'persisted'
export type MasterDetailCaptionSurface = 'list' | 'detail'

export interface MasterDetailItemMeta {
  /** Shared resolver. System only when the id was on the loaded system entity. */
  provenance: MasterDetailProvenance
  /** Shared resolver. Persisted when the id is on the latest saved entity. */
  persistence: MasterDetailPersistence
  /** Domain classification, such as "Natural weapon". */
  kindLabel?: string
  /**
   * List phrase when it differs from the kind. Detail keeps `kindLabel`.
   * Omit it when the list should show the kind.
   */
  summary?: string
  /** Detail-only placement, such as "Actions". */
  sectionLabel?: string
  /** Leading list label, such as "Level 1". Not part of the detail caption. */
  eyebrow?: string
}

/**
 * Chooses which resolved facts a surface shows. Omitting a fact does not
 * change it. Provenance is hidden when a kind label or Unsaved already
 * identifies the row.
 */
export function joinMasterDetailCaption(
  meta: MasterDetailItemMeta,
  surface: MasterDetailCaptionSurface,
  sourceName?: string,
): string {
  const state =
    meta.persistence === 'new'
      ? resolveMasterDetailSourceLabel('unsaved')
      : meta.kindLabel
        ? undefined
        : resolveMasterDetailSourceLabel(meta.provenance)

  return joinInlineMetadata([
    surface === 'detail' ? sourceName : undefined,
    surface === 'detail' ? meta.eyebrow : undefined,
    surface === 'list' ? (meta.summary ?? meta.kindLabel) : meta.kindLabel,
    surface === 'detail' ? meta.sectionLabel : undefined,
    state,
  ])
}
