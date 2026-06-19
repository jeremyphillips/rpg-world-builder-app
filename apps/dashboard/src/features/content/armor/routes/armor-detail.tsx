import { useParams } from 'react-router-dom'
import type { Armor } from '@rpg/contracts'
import { Spinner, Heading, Text } from '@rpg/ui'

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
    return <Spinner />
  }

  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        Could not load armor.
      </Text>
    )
  }

  const item = findById(armor, armorId)

  if (!item) {
    return (
      <Text variant="destructive" role="alert">
        Armor not found.
      </Text>
    )
  }

  return <ArmorDetailContent item={item} />
}
