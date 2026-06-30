import type { ContentSource } from '@rpg/contracts'

import { INACTIVE_ROW_BADGE_LABEL, isContentRowActive } from './content-campaign-availability'
import type { ContentFormCtx } from '../forms/content-form-registry'
import type { MasterDetailListBadge } from '../../components/master-detail/master-detail-list-panel.client'

export type EmbeddedRowSource = 'system' | 'homebrew'

const SOURCE_BADGE = {
  system: { variant: 'secondary', label: 'System' },
  homebrew: { variant: 'outline', label: 'Homebrew' },
} as const satisfies Record<
  EmbeddedRowSource,
  { variant: MasterDetailListBadge['variant']; label: string }
>

export interface ResolveEmbeddedRowMetaParams {
  row: { id?: string } | undefined
  entitySource: ContentFormCtx['entitySource']
  seedRowIds?: ReadonlySet<string>
  activeById: Record<string, boolean>
  rowKey: string
}

export interface EmbeddedRowMeta {
  source: EmbeddedRowSource
  deletable: boolean
  badges: MasterDetailListBadge[]
  active: boolean
}

/** Resolves ownership for embedded rows that have no per-row `source` in the contract. */
export function resolveEmbeddedRowSource(
  row: { id?: string } | undefined,
  entitySource: ContentSource | undefined,
  seedRowIds?: ReadonlySet<string>,
): EmbeddedRowSource {
  const rowId = row?.id
  if (entitySource !== 'system') return 'homebrew'
  if (typeof rowId !== 'string' || rowId.length === 0) return 'homebrew'
  if (seedRowIds) return seedRowIds.has(rowId) ? 'system' : 'homebrew'
  return 'system'
}

export function resolveEmbeddedRowMeta({
  row,
  entitySource,
  seedRowIds,
  activeById,
  rowKey,
}: ResolveEmbeddedRowMetaParams): EmbeddedRowMeta {
  const source = resolveEmbeddedRowSource(row, entitySource, seedRowIds)
  const active = isContentRowActive(activeById, rowKey)
  const badges: MasterDetailListBadge[] = [SOURCE_BADGE[source]]

  if (!active) {
    badges.push({ variant: 'outline', label: INACTIVE_ROW_BADGE_LABEL })
  }

  return {
    source,
    deletable: source !== 'system',
    badges,
    active,
  }
}
