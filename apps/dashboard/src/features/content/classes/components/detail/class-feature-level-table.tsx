import { cn, Heading, RichTextContent, Table, TableBody, TableCell, TableRow } from '@rpg/ui'
import type { ContentTable } from '@rpg/contracts'

import { ContentTableView } from '../../../components/tables/content-table-view'
import { contentDetailNavItemId } from '../../../lib/detail/page/content-detail-nav-anchor-id'
import {
  contentDetailSectionPanelContentHeadingClasses,
  useContentDetailSectionNavLeaf,
} from '../../../lib/detail/page/content-detail-section'
import type { ClassFeatureDetailItem } from '../../lib/class-display'

import {
  classFeatureLevelTableBodyClasses,
  classFeatureLevelTableClasses,
  classFeatureLevelTableContentCellClasses,
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
    const inlineTables = (item.tables ?? []).filter((table) => table.kind === 'general')

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
        <TableCell className={classFeatureLevelTableContentCellClasses}>
          <div className={classFeatureLevelTableFeatureBlockClasses}>
            <Heading
              variant="subsection"
              as="h4"
              id={contentDetailNavItemId('feature', item.id)}
              className={contentDetailSectionPanelContentHeadingClasses}
            >
              {item.title}
            </Heading>
            {item.bodyHtml ? <RichTextContent html={item.bodyHtml} size="md" tone="muted" /> : null}
            {inlineTables.length > 0 ? (
              <div className="space-y-4">
                {inlineTables.map((table: ContentTable) => (
                  <ContentTableView key={table.id} table={table} />
                ))}
              </div>
            ) : null}
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
