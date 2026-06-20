import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { Armor } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useArmor } from '../hooks/use-armor'
import { armorColumns, armorFilters } from '../components/armor-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

function ArmorRowActions({ row, campaignId }: { row: Armor; campaignId: string }) {
  return (
    <RowActionsMenu
      editHref={ROUTES.content.armor.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel="armor"
    />
  )
}

export function ArmorOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: armor = [], isPending, isError } = useArmor(campaignId)

  return (
    <ContentOverviewShell
      heading="Armor"
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.armor.create(campaignId)}
      newLabel="New Armor"
    >
      <DataTable
        columns={armorColumns(campaignId)}
        data={armor}
        filters={armorFilters}
        rowActions={(row) => <ArmorRowActions row={row} campaignId={campaignId} />}
        caption="Armor available in this campaign"
      />
    </ContentOverviewShell>
  )
}
