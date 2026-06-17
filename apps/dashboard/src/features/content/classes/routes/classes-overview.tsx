import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { CharacterClass } from '@rpg/contracts'

import { useClasses } from '../hooks/use-classes'
import { classColumns, classFilters } from '../components/classes-columns'

function ClassRowActions(_: { row: CharacterClass }) {
  return <RowActionsMenu editHref="#" enabled={true} onToggleEnabled={() => {}} itemLabel="class" />
}

export function ClassesOverview() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)

  if (isPending) {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Classes</h2>
        <p className="text-sm text-muted-foreground">Loading classes…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Classes</h2>
        <p role="alert" className="text-sm text-destructive">
          Could not load classes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Classes</h2>
      <DataTable
        columns={classColumns(campaignId ?? '')}
        data={classes}
        filters={classFilters}
        rowActions={(row) => <ClassRowActions row={row} />}
        caption="Character classes available in this campaign"
      />
    </div>
  )
}
