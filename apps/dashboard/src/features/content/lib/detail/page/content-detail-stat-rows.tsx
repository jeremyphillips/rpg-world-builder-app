import { cn } from '@rpg/ui'

import { ContentStatRowHeroPair } from '../metadata/content-stat-row'
import {
  contentDetailStatRowsColumnClasses,
  contentDetailStatRowsGridClasses,
  contentDetailStatRowsSplitClasses,
  contentDetailStatRowsSplitDividerClasses,
} from '../metadata/content-stat-row.variants'
import type { ContentStatRowData } from '../metadata/content-stat-rows'

function ContentDetailStatRowsColumn({ statRows }: { statRows: ContentStatRowData[] }) {
  return (
    <div className={cn(contentDetailStatRowsColumnClasses, contentDetailStatRowsGridClasses)}>
      {statRows.map((row) => (
        <ContentStatRowHeroPair key={row.label} {...row} />
      ))}
    </div>
  )
}

export function ContentDetailStatRows({ statRows }: { statRows: ContentStatRowData[] }) {
  if (statRows.length <= 3) {
    return <ContentDetailStatRowsColumn statRows={statRows} />
  }

  const splitIndex = Math.ceil(statRows.length / 2)
  const firstColumn = statRows.slice(0, splitIndex)
  const secondColumn = statRows.slice(splitIndex)

  return (
    <div className={contentDetailStatRowsSplitClasses}>
      <ContentDetailStatRowsColumn statRows={firstColumn} />
      <div aria-hidden className={contentDetailStatRowsSplitDividerClasses} />
      <ContentDetailStatRowsColumn statRows={secondColumn} />
    </div>
  )
}
