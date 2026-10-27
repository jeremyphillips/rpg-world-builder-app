import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import type { MonsterDetailsLeafViewModel } from './monster-display'

export function buildDetailsStatRows(
  leaves: readonly MonsterDetailsLeafViewModel[],
): ContentStatRowData[] {
  return leaves.map((leaf) => ({
    id: leaf.id,
    label: leaf.label,
    value: leaf.body,
  }))
}
