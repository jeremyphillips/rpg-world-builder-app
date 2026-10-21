import { Link, useParams } from 'react-router-dom'
import { Card } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page/page-header'
import { PageShell } from '@/components/layout/page/page-shell'
import { ROUTES } from '@/app/routes'
import { getContentTypeCollectionLabel } from '@/features/content/lib/content-type-labels'

import {
  EQUIPMENT_FAMILY_PATHS,
  getEquipmentFamilyLabel,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

type EquipmentHubContentProps = {
  campaignId: string
}

export function EquipmentHubContent({ campaignId }: EquipmentHubContentProps) {
  return (
    <PageShell width="full" rhythm="relaxed">
      <PageHeader heading={getContentTypeCollectionLabel('equipment')} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EQUIPMENT_FAMILY_PATHS.map((family) => (
          <li key={family} className="h-full">
            <Card
              link={<Link to={ROUTES.content.equipment.family(campaignId, family)} />}
              stretch
              className="h-full"
              density="comfortable"
              tone="strong"
              header={{ title: getEquipmentFamilyLabel(family as EquipmentFamilyPath) }}
            />
          </li>
        ))}
      </ul>
    </PageShell>
  )
}

export function EquipmentHub() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <EquipmentHubContent campaignId={campaignId} />
}
