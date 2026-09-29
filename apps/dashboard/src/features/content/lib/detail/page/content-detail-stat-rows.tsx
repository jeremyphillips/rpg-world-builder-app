import { cn } from '@rpg/ui'
import { forwardRef, type CSSProperties } from 'react'

import { ContentStatRowHeroPair } from '../metadata/content-stat-row'
import {
  contentDetailStatRowsGridClasses,
  contentDetailStatRowsGroupClasses,
  contentDetailStatRowsGroupTrailingDividerClasses,
  contentDetailStatRowsHostClasses,
} from '../metadata/content-stat-row.variants'
import type { ContentStatRowData } from '../metadata/content-stat-rows'
import {
  DEFAULT_HERO_STAT_ROW_COLUMN_COUNT,
  partitionHeroStatRowGroups,
} from './partition-hero-stat-row-groups.lib'
import { STAT_ROW_GROUP_DIVIDER_INSET_FROM_TRAILING_EDGE } from './stat-row-group-layout.constants'
import { useContentDetailStatRowGroupLayout } from './use-content-detail-stat-row-group-layout'

const ContentDetailStatRowsGroup = forwardRef<
  HTMLDivElement,
  {
    statRows: ContentStatRowData[]
    showTrailingDivider: boolean
    labelColumnWidthPx?: number
  }
>(function ContentDetailStatRowsGroup({ statRows, showTrailingDivider, labelColumnWidthPx }, ref) {
  const style: CSSProperties | undefined = (() => {
    const vars: Record<string, string> = {}
    if (labelColumnWidthPx !== undefined) {
      vars['--content-detail-stat-label-col'] = `${labelColumnWidthPx}px`
    }
    if (showTrailingDivider) {
      vars['--content-detail-stat-divider-inset'] = STAT_ROW_GROUP_DIVIDER_INSET_FROM_TRAILING_EDGE
    }
    return Object.keys(vars).length > 0 ? (vars as CSSProperties) : undefined
  })()

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        contentDetailStatRowsGroupClasses,
        contentDetailStatRowsGridClasses,
        showTrailingDivider && contentDetailStatRowsGroupTrailingDividerClasses,
      )}
      data-slot="content-detail-stat-rows-group"
      data-trailing-divider={showTrailingDivider ? 'true' : 'false'}
    >
      {statRows.map((row) => (
        <ContentStatRowHeroPair key={row.id ?? row.label} {...row} />
      ))}
    </div>
  )
})

export function ContentDetailStatRows({
  statRows,
  columnCount = DEFAULT_HERO_STAT_ROW_COLUMN_COUNT,
}: {
  statRows: ContentStatRowData[]
  /** Side-by-side groups once the hero has more than three rows. Default 2. */
  columnCount?: number
}) {
  const groups = partitionHeroStatRowGroups(statRows, columnCount)
  const { hostRef, setGroupRef, layout } = useContentDetailStatRowGroupLayout(groups.length)

  return (
    <div
      ref={hostRef}
      className={contentDetailStatRowsHostClasses}
      data-slot="content-detail-stat-rows-host"
    >
      {groups.map((group, index) => {
        const groupKey = group.map((row) => row.id ?? row.label).join('\0') ?? index

        return (
          <ContentDetailStatRowsGroup
            key={groupKey}
            ref={setGroupRef(index)}
            statRows={group}
            showTrailingDivider={layout.trailingDividerAfterGroup[index] ?? false}
            labelColumnWidthPx={layout.labelColumnWidthPx}
          />
        )
      })}
    </div>
  )
}
