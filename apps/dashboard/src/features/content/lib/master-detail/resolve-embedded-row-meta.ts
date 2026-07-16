import type { ContentSource } from '@rpg/contracts'

import {
  combineAvailabilityReasons,
  resolveAvailabilityBadge,
  type Availability,
  type AvailabilityReason,
} from '@/lib/availability'
import type { ContentFormCtx } from '../forms/content-form-registry'
import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

import type { MasterDetailListBadge } from '../../components/master-detail/master-detail-list-panel.client'
import { isContentRowActive } from './content-campaign-availability'

export type EmbeddedRowSource = 'system' | 'homebrew'

const SOURCE_BADGE = {
  system: { appearance: 'neutral', tone: 'neutral', label: 'System' },
  homebrew: { appearance: 'outline', tone: 'neutral', label: 'Homebrew' },
} as const satisfies Record<
  EmbeddedRowSource,
  { appearance: BadgeAppearance; tone: BadgeTone; label: string }
>

export interface ResolveEmbeddedRowMetaParams {
  row: { id?: string } | undefined
  entitySource: ContentFormCtx['entitySource']
  seedRowIds?: ReadonlySet<string>
  activeById: Record<string, boolean>
  rowKey: string
  extraReasons?: readonly AvailabilityReason[]
}

export interface EmbeddedRowMeta {
  source: EmbeddedRowSource
  deletable: boolean
  badges: MasterDetailListBadge[]
  active: boolean
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
  activeById,
  rowKey,
  extraReasons = [],
}: ResolveEmbeddedRowMetaParams): EmbeddedRowMeta {
  const source = resolveEmbeddedRowSource(row, entitySource, seedRowIds)
  const activeByToggle = isContentRowActive(activeById, rowKey)
  const availability = combineAvailabilityReasons(activeByToggle, extraReasons)
  const active = availability.status === 'active'
  const badges: MasterDetailListBadge[] = [SOURCE_BADGE[source]]

  const availabilityBadge = resolveAvailabilityBadge(availability)
  if (availabilityBadge) {
    badges.push(availabilityBadge)
  }

  return {
    source,
    deletable: source !== 'system',
    badges,
    active,
    availability,
  }
}
