import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useEquipment } from '../hooks/use-equipment'
import { equipmentColumns, equipmentFilters } from '../components/equipment-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/content-overview-row-actions'

function EquipmentRowActions({ row, campaignId }: { row: Equipment; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.equipment.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel="equipment"
    />
  )
}

export function EquipmentOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)

  return (
    <ContentOverviewShell
      heading="Equipment"
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.equipment.create(campaignId)}
      newLabel="New Equipment"
    >
      <DataTable
        columns={equipmentColumns(campaignId)}
        data={equipment}
        filters={equipmentFilters}
        rowActions={(row) => <EquipmentRowActions row={row} campaignId={campaignId} />}
        caption="Equipment available in this campaign"
      />
    </ContentOverviewShell>
  )
}
