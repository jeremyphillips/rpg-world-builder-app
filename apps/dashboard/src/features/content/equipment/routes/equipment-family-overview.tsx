import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { useEquipment } from '../hooks/use-equipment'
import {
  loadFamilyTableConfig,
  type FamilyTableConfig,
} from '../lib/shared/equipment-family-columns'
import { ContentOverviewShell } from '../../lib/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/content-overview-row-actions'
import {
  familyPathToEquipmentKind,
  getEquipmentFamilyLabel,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

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
  const kind = familyPathToEquipmentKind(family)
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)
  const filtered = kind ? equipment.filter((item) => item.kind === kind) : []
  const heading = getEquipmentFamilyLabel(family)
  const [tableConfig, setTableConfig] = useState<FamilyTableConfig | null>(null)
  const [columnsError, setColumnsError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTableConfig(null)
    setColumnsError(false)

    void loadFamilyTableConfig(campaignId, family)
      .then((config) => {
        if (!cancelled) setTableConfig(config)
      })
      .catch(() => {
        if (!cancelled) setColumnsError(true)
      })

    return () => {
      cancelled = true
    }
  }, [campaignId, family])

  const tablePending = tableConfig === null && !columnsError

  return (
    <ContentOverviewShell
      heading={heading}
      campaignId={campaignId}
      isPending={isPending || tablePending}
      isError={isError || columnsError}
      newHref={ROUTES.content.equipment.create(campaignId, family)}
      newLabel={`New ${heading.replace(/s$/, '')}`}
    >
      {tableConfig ? (
        <DataTable
          columns={tableConfig.columns}
          data={filtered}
          filters={tableConfig.filters}
          rowActions={(row) => (
            <EquipmentRowActions row={row} campaignId={campaignId} family={family} />
          )}
          caption={`${heading} available in this campaign`}
        />
      ) : null}
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
