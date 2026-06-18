import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { Weapon } from '@rpg/contracts'

import { useWeapons } from '../hooks/use-weapons'
import { weaponsColumns, weaponsFilters } from '../components/weapons-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

function WeaponRowActions(_: { row: Weapon }) {
  return (
    <RowActionsMenu editHref="#" enabled={true} onToggleEnabled={() => {}} itemLabel="weapon" />
  )
}

export function WeaponsOverview() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: weapons = [], isPending, isError } = useWeapons(campaignId)

  return (
    <ContentOverviewShell heading="Weapons" isPending={isPending} isError={isError}>
      <DataTable
        columns={weaponsColumns(campaignId ?? '')}
        data={weapons}
        filters={weaponsFilters}
        rowActions={(row) => <WeaponRowActions row={row} />}
        caption="Weapons available in this campaign"
      />
    </ContentOverviewShell>
  )
}
