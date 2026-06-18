import { useParams } from 'react-router-dom'
import type { Armor } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useArmor } from '../hooks/use-armor'
import { getArmorStatRows } from '../lib/armor-stat-rows'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

type ArmorDetailContentProps = { item: Armor }

function ArmorDetailContent({ item }: ArmorDetailContentProps) {
  useSetBreadcrumbLabel(item.name)
  const statRows = getArmorStatRows(item)

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

function findById(list: Armor[], id: string): Armor | undefined {
  return list.find((a) => a.id === id)
}

export function ArmorDetail() {
  const { campaignId = '', armorId = '' } = useParams<{
    campaignId: string
    armorId: string
  }>()
  const { data: armor = [], isPending, isError } = useArmor(campaignId)

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Could not load armor.
      </p>
    )
  }

  const item = findById(armor, armorId)

  if (!item) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Armor not found.
      </p>
    )
  }

  return <ArmorDetailContent item={item} />
}
