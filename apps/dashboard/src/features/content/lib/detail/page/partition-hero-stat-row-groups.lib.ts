import type { ContentStatRowData } from '../metadata/content-stat-rows'

/** Rows that still fit in one group, so short heroes stay a single column. */
const HERO_STAT_ROW_GROUP_MAX = 3

/** Side-by-side groups when the hero has more rows than {@link HERO_STAT_ROW_GROUP_MAX}. */
export const DEFAULT_HERO_STAT_ROW_COLUMN_COUNT = 2

/**
 * Splits hero metadata into up to `columnCount` balanced groups for the flex-wrap host.
 * Three or fewer rows stay in one group.
 */
export function partitionHeroStatRowGroups(
  statRows: readonly ContentStatRowData[],
  columnCount: number = DEFAULT_HERO_STAT_ROW_COLUMN_COUNT,
): ContentStatRowData[][] {
  const columns = Math.max(1, Math.floor(columnCount))
  if (statRows.length <= HERO_STAT_ROW_GROUP_MAX || columns <= 1) {
    return [statRows.slice()]
  }

  const groupCount = Math.min(columns, statRows.length)
  const groups: ContentStatRowData[][] = []
  let offset = 0
  let remainingRows = statRows.length

  for (let remainingColumns = groupCount; remainingColumns > 0; remainingColumns -= 1) {
    const size = Math.ceil(remainingRows / remainingColumns)
    groups.push(statRows.slice(offset, offset + size))
    offset += size
    remainingRows -= size
  }

  return groups
}
