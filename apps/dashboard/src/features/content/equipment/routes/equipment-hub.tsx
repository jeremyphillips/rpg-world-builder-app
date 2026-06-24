import { Link, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, Heading } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

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
    <div className="space-y-6">
      <Heading variant="page" as="h2">
        Equipment
      </Heading>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EQUIPMENT_FAMILY_PATHS.map((family) => (
          <li key={family}>
            <Link
              to={ROUTES.content.equipment.family(campaignId, family)}
              className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle>{getEquipmentFamilyLabel(family as EquipmentFamilyPath)}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function EquipmentHub() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <EquipmentHubContent campaignId={campaignId} />
}
