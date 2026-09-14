import type { ContentSource } from '@rpg/contracts'

import { resolveAvailability, type Availability, type AvailabilityReason } from '@/lib/availability'
import type { ContentFormCtx } from '../forms/registry/content-form-registry'

export type EmbeddedRowSource = 'system' | 'homebrew'

const SOURCE_LABELS = {
  system: 'System',
  homebrew: 'Homebrew',
} as const satisfies Record<EmbeddedRowSource, string>

export interface ResolveEmbeddedRowMetaParams {
  row: { id?: string } | undefined
  entitySource: ContentFormCtx['entitySource']
  seedRowIds?: ReadonlySet<string>
  extraReasons?: readonly AvailabilityReason[]
}

export interface EmbeddedRowMeta {
  source: EmbeddedRowSource
  sourceLabel: string
  deletable: boolean
  availability: Availability
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
  extraReasons = [],
}: ResolveEmbeddedRowMetaParams): EmbeddedRowMeta {
  const source = resolveEmbeddedRowSource(row, entitySource, seedRowIds)
  const availability = resolveAvailability(extraReasons)

  return {
    source,
    sourceLabel: SOURCE_LABELS[source],
    deletable: source !== 'system',
    availability,
  }
}
