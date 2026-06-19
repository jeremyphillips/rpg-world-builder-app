import { useParams } from 'react-router-dom'
import type { Weapon } from '@rpg/contracts'
import { Spinner, Heading, Text } from '@rpg/ui'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useWeapons } from '../hooks/use-weapons'
import { getWeaponStatRows } from '../lib/weapon-stat-rows'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

type WeaponDetailContentProps = { item: Weapon }

export function WeaponDetailContent({ item }: WeaponDetailContentProps) {
  useSetBreadcrumbLabel(item.name)
  const statRows = getWeaponStatRows(item)

  return (
    <ContentDetailLayout imageUrl={getContentImageUrl(item.imageKey)} imageName={item.name}>
      <div className="space-y-4">
        <Heading variant="display" as="h2">
          {item.name}
        </Heading>
        <div className="space-y-3">
          {statRows.map(({ label, value }) => (
            <ContentStatRow key={label} label={label} value={value} />
          ))}
        </div>
        {item.description && <Text variant="muted">{item.description}</Text>}
      </div>
    </ContentDetailLayout>
  )
}

function findById(list: Weapon[], id: string): Weapon | undefined {
  return list.find((w) => w.id === id)
}

export function WeaponDetail() {
  const { campaignId = '', weaponId = '' } = useParams<{
    campaignId: string
    weaponId: string
  }>()
  const { data: weapons = [], isPending, isError } = useWeapons(campaignId)

  if (isPending) {
    return <Spinner />
  }

  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        Could not load weapons.
      </Text>
    )
  }

  const item = findById(weapons, weaponId)

  if (!item) {
    return (
      <Text variant="destructive" role="alert">
        Weapon not found.
      </Text>
    )
  }

  return <WeaponDetailContent item={item} />
}
