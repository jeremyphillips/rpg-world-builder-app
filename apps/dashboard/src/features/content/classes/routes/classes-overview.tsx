import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { CharacterClass } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useClasses } from '../hooks/use-classes'
import { classColumns, classFilters } from '../lib/classes-overview-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/content-overview-row-actions'

function ClassRowActions({ row, campaignId }: { row: CharacterClass; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.classes.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel="class"
    />
  )
}

export function ClassesOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)

  return (
    <ContentOverviewShell
      heading="Classes"
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.classes.create(campaignId)}
      newLabel="New Class"
    >
      <DataTable
        columns={classColumns(campaignId)}
        data={classes}
        filters={classFilters}
        rowActions={(row) => <ClassRowActions row={row} campaignId={campaignId} />}
        caption="Character classes available in this campaign"
      />
    </ContentOverviewShell>
  )
}
