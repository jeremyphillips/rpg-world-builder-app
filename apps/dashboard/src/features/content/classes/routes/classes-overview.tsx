import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { CharacterClass } from '@rpg/contracts'

import { useClasses } from '../hooks/use-classes'
import { classColumns, classFilters } from '../components/classes-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

function ClassRowActions(_: { row: CharacterClass }) {
  return <RowActionsMenu editHref="#" enabled={true} onToggleEnabled={() => {}} itemLabel="class" />
}

export function ClassesOverview() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)

  return (
    <ContentOverviewShell heading="Classes" isPending={isPending} isError={isError}>
      <DataTable
        columns={classColumns(campaignId ?? '')}
        data={classes}
        filters={classFilters}
        rowActions={(row) => <ClassRowActions row={row} />}
        caption="Character classes available in this campaign"
      />
    </ContentOverviewShell>
  )
}
