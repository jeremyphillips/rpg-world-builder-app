import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useEquipmentFamilyOverview } from '../hooks/use-equipment-family-overview'
import type { FamilyTableConfig } from '../lib/shared/equipment-family-overview-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/content-overview-row-actions'
import type { EquipmentFamilyPath } from '../lib/shared/equipment-family-paths'

function EquipmentRowActions({
  row,
  campaignId,
  family,
}: {
  row: Equipment
  campaignId: string
  family: EquipmentFamilyPath
}) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.equipment.edit(campaignId, family, row.id)}
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
  const overview = useEquipmentFamilyOverview(campaignId, family)

  return (
    <ContentOverviewShell
      heading={overview.heading}
      campaignId={campaignId}
      isPending={overview.isPending}
      isError={overview.isError}
      newHref={overview.newHref}
      newLabel={overview.newLabel}
    >
      {overview.tableConfig ? (
        <EquipmentFamilyTable
          tableConfig={overview.tableConfig}
          data={overview.filtered}
          heading={overview.heading}
          campaignId={campaignId}
          family={family}
        />
      ) : null}
    </ContentOverviewShell>
  )
}

function EquipmentFamilyTable({
  tableConfig,
  data,
  heading,
  campaignId,
  family,
}: {
  tableConfig: FamilyTableConfig
  data: Equipment[]
  heading: string
  campaignId: string
  family: EquipmentFamilyPath
}) {
  return (
    <DataTable
      columns={tableConfig.columns}
      data={data}
      filters={tableConfig.filters}
      rowActions={(row) => (
        <EquipmentRowActions row={row} campaignId={campaignId} family={family} />
      )}
      caption={`${heading} available in this campaign`}
    />
  )
}

type EquipmentFamilyOverviewProps = {
  family: EquipmentFamilyPath
}

export function EquipmentFamilyOverview({ family }: EquipmentFamilyOverviewProps) {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <EquipmentFamilyOverviewContent campaignId={campaignId} family={family} />
}
