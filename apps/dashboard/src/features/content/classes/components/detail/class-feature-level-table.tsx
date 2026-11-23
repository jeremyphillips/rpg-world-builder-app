import { cn, Heading, Table, TableBody, TableCell, TableRow } from '@rpg/ui'

import { FacingDetailBody } from '../../../facing/facing-detail-body'
import { contentDetailNavItemId } from '../../../lib/detail/page/content-detail-nav-anchor-id'
import { contentDetailSectionPanelContentHeadingClasses } from '../../../lib/detail/page/content-detail-section.variants'
import { useContentDetailSectionNavLeaf } from '../../../lib/detail/page/use-content-detail-section-nav-leaf'
import type { ClassFeatureDetailItem } from '../../lib/class-display'

import {
  classFeatureLevelTableBodyClasses,
  classFeatureLevelTableClasses,
  classFeatureLevelTableFeatureBlockClasses,
  classFeatureLevelTableLevelCellClasses,
  classFeatureLevelTableRowClasses,
} from './class-feature-level-table.variants'

type LevelGroup = {
  level: number
  items: ClassFeatureDetailItem[]
}

function groupFeaturesByLevel(items: readonly ClassFeatureDetailItem[]): LevelGroup[] {
  const groups: LevelGroup[] = []
  for (const item of items) {
    const last = groups.at(-1)
    if (last && last.level === item.level) {
      last.items.push(item)
    } else {
      groups.push({ level: item.level, items: [item] })
    }
  }
  return groups
}

function ClassFeatureLevelGroupRows({ group }: { group: LevelGroup }) {
  const anchorId = contentDetailNavItemId('feature-level', String(group.level))
  useContentDetailSectionNavLeaf(anchorId, `Level ${group.level}`)

  return group.items.map((item, rowIndexInGroup) => {
    const isFirstInGroup = rowIndexInGroup === 0
    return (
      <TableRow
        key={item.id}
        id={isFirstInGroup ? anchorId : undefined}
        className={classFeatureLevelTableRowClasses}
      >
        {isFirstInGroup ? (
          <TableCell
            rowSpan={group.items.length}
            className={classFeatureLevelTableLevelCellClasses}
          >
            Level {group.level}
          </TableCell>
        ) : null}
        <TableCell className="align-top">
          <div className={classFeatureLevelTableFeatureBlockClasses}>
            <Heading
              variant="subsection"
              as="h4"
              id={contentDetailNavItemId('feature', item.id)}
              className={contentDetailSectionPanelContentHeadingClasses}
            >
              {item.title}
            </Heading>
            <FacingDetailBody resolution={item.facing} />
          </div>
        </TableCell>
      </TableRow>
    )
  })
}

export type ClassFeatureLevelTableProps = {
  items: readonly ClassFeatureDetailItem[]
}

export function ClassFeatureLevelTable({ items }: ClassFeatureLevelTableProps) {
  const groups = groupFeaturesByLevel(items)

  if (groups.length === 0) return null

  return (
    <Table className={cn(classFeatureLevelTableClasses)}>
      <TableBody className={classFeatureLevelTableBodyClasses}>
        {groups.map((group) => (
          <ClassFeatureLevelGroupRows key={group.level} group={group} />
        ))}
      </TableBody>
    </Table>
  )
}
