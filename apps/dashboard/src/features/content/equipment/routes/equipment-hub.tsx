import { Link, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page-header'
import { WidePage } from '@/components/layout/wide-page'
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
    <WidePage spacing="relaxed">
      <PageHeader heading={getContentTypeCollectionLabel('equipment')} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EQUIPMENT_FAMILY_PATHS.map((family) => (
          <li key={family}>
            <Link
              to={ROUTES.content.equipment.family(campaignId, family)}
              className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-colors hover:bg-row-hover">
                <CardHeader>
                  <CardTitle>{getEquipmentFamilyLabel(family as EquipmentFamilyPath)}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </WidePage>
  )
}

export function EquipmentHub() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <EquipmentHubContent campaignId={campaignId} />
}
