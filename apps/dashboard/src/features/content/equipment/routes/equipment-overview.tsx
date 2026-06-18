import { useParams } from 'react-router-dom'
import { DataTable, RowActionsMenu } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { useEquipment } from '../hooks/use-equipment'
import { equipmentColumns, equipmentFilters } from '../components/equipment-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'

function EquipmentRowActions(_: { row: Equipment }) {
  return (
    <RowActionsMenu editHref="#" enabled={true} onToggleEnabled={() => {}} itemLabel="equipment" />
  )
}

export function EquipmentOverview() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)

  return (
    <ContentOverviewShell heading="Equipment" isPending={isPending} isError={isError}>
      <DataTable
        columns={equipmentColumns(campaignId ?? '')}
        data={equipment}
        filters={equipmentFilters}
        rowActions={(row) => <EquipmentRowActions row={row} />}
        caption="Equipment available in this campaign"
      />
    </ContentOverviewShell>
  )
}
