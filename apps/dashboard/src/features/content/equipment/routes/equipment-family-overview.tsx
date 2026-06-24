import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useEquipment } from '../hooks/use-equipment'
import { equipmentColumns, equipmentFilters } from '../components/equipment-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/content-overview-row-actions'
import {
  familyPathToEquipmentKind,
  getEquipmentFamilyLabel,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

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

type EquipmentFamilyOverviewContentProps = {
  campaignId: string
  family: EquipmentFamilyPath
}

export function EquipmentFamilyOverviewContent({
  campaignId,
  family,
}: EquipmentFamilyOverviewContentProps) {
  const kind = familyPathToEquipmentKind(family)
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)
  const filtered = kind ? equipment.filter((item) => item.kind === kind) : []
  const heading = getEquipmentFamilyLabel(family)

  return (
    <ContentOverviewShell
      heading={heading}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.equipment.create(campaignId, family)}
      newLabel={`New ${heading.replace(/s$/, '')}`}
    >
      <DataTable
        columns={equipmentColumns(campaignId).filter(
          (column) => 'accessorKey' in column && column.accessorKey !== 'kind',
        )}
        data={filtered}
        filters={equipmentFilters.filter((filter) => filter.id !== 'kind')}
        rowActions={(row) => <EquipmentRowActions row={row} campaignId={campaignId} />}
        caption={`${heading} available in this campaign`}
      />
    </ContentOverviewShell>
  )
}

type EquipmentFamilyOverviewProps = {
  family: EquipmentFamilyPath
}

export function EquipmentFamilyOverview({ family }: EquipmentFamilyOverviewProps) {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <EquipmentFamilyOverviewContent campaignId={campaignId} family={family} />
}
