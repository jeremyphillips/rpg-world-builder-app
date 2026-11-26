import { useParams } from 'react-router-dom'
import type { Equipment, WithCampaignAccess } from '@rpg/contracts'

import type { ContentOverlayFailureOverviewRow } from '../../lib/list/create-content-list'
import { Alert, type ColumnDef, Text } from '@rpg/ui'
import type { FilterSchema } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { useEquipmentFamilyOverview } from '../hooks/use-equipment-family-overview'
import type { FamilyTableConfig } from '../lib/shared/equipment-family-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table'
import type { EquipmentFamilyPath } from '../lib/shared/equipment-family-paths'

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
      {overview.rulesetLookupFailed ? (
        <Alert variant="warning" role="status">
          <Text variant="body">
            Could not resolve the campaign ruleset. Unresolved overlay rows are listed without
            family classification until ruleset context is available.
          </Text>
        </Alert>
      ) : null}
      {overview.tableConfig ? (
        <EquipmentFamilyTable
          tableConfig={overview.tableConfig}
          data={
            overview.filtered as Array<
              WithCampaignAccess<Equipment> | ContentOverlayFailureOverviewRow
            >
          }
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
  data: Array<WithCampaignAccess<Equipment> | ContentOverlayFailureOverviewRow>
  heading: string
  campaignId: string
  family: EquipmentFamilyPath
}) {
  return (
    <ContentOverviewTable<WithCampaignAccess<Equipment> | ContentOverlayFailureOverviewRow>
      contentTypeKey="equipment"
      campaignId={campaignId}
      columns={
        tableConfig.columns as ColumnDef<
          WithCampaignAccess<Equipment> | ContentOverlayFailureOverviewRow,
          unknown
        >[]
      }
      filterSchema={
        tableConfig.filterSchema as FilterSchema<
          WithCampaignAccess<Equipment> | ContentOverlayFailureOverviewRow,
          Record<string, unknown>
        >
      }
      data={data}
      caption={`${heading} available in this campaign`}
      getEditHref={(row) => ROUTES.content.equipment.edit(campaignId, family, row.id)}
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
