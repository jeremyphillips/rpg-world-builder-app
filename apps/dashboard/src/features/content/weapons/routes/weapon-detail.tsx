import { useParams } from 'react-router-dom'
import type { Weapon } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useWeapons } from '../hooks/use-weapons'
import { getWeaponStatRows } from '../lib/weapon-stat-rows'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

type WeaponDetailContentProps = { item: Weapon }

function WeaponDetailContent({ item }: WeaponDetailContentProps) {
  useSetBreadcrumbLabel(item.name)
  const statRows = getWeaponStatRows(item)

  return (
    <ContentDetailLayout imageUrl={getContentImageUrl(item.imageKey)} imageName={item.name}>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">{item.name}</h2>
        <div className="space-y-3">
          {statRows.map(({ label, value }) => (
            <ContentStatRow key={label} label={label} value={value} />
          ))}
        </div>
        {item.description && <p className="text-muted-foreground">{item.description}</p>}
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
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Could not load weapons.
      </p>
    )
  }

  const item = findById(weapons, weaponId)

  if (!item) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Weapon not found.
      </p>
    )
  }

  return <WeaponDetailContent item={item} />
}
