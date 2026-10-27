import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import { MONSTER_DETAIL_DETAILS_LEAF_IDS } from './monster-detail-sections'
import type { MonsterDetailsLeafViewModel } from './monster-display'

export function buildDetailsStatRows(
  leaves: readonly MonsterDetailsLeafViewModel[],
): ContentStatRowData[] {
  return leaves.map((leaf) => ({
    id:
      MONSTER_DETAIL_DETAILS_LEAF_IDS[leaf.id as keyof typeof MONSTER_DETAIL_DETAILS_LEAF_IDS] ??
      `monster-details-${leaf.id}`,
    label: leaf.label,
    value: leaf.body,
  }))
}
