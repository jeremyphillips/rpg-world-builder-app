import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { Armor } from '@rpg/contracts'

import { useArmor } from '../hooks/use-armor'
import { armorColumns, armorFilters } from '../components/armor-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

function ArmorRowActions(_: { row: Armor }) {
  return <RowActionsMenu editHref="#" enabled={true} onToggleEnabled={() => {}} itemLabel="armor" />
}

export function ArmorOverview() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: armor = [], isPending, isError } = useArmor(campaignId)

  return (
    <ContentOverviewShell heading="Armor" isPending={isPending} isError={isError}>
      <DataTable
        columns={armorColumns(campaignId ?? '')}
        data={armor}
        filters={armorFilters}
        rowActions={(row) => <ArmorRowActions row={row} />}
        caption="Armor available in this campaign"
      />
    </ContentOverviewShell>
  )
}
