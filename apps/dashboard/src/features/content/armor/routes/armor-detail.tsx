import { useParams } from 'react-router-dom'
import type { Armor } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useArmor } from '../hooks/use-armor'
import { getArmorStatRows } from '../lib/armor-stat-rows'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

type ArmorDetailContentProps = { item: Armor }

export function ArmorDetailContent({ item }: ArmorDetailContentProps) {
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

export function ArmorDetail() {
  const { campaignId = '', armorId = '' } = useParams<{
    campaignId: string
    armorId: string
  }>()
  const { data: armor = [], isPending, isError } = useArmor(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={armor}
      itemId={armorId}
      loadErrorLabel="Could not load armor."
      notFoundLabel="Armor not found."
    >
      {(item) => <ArmorDetailContent item={item} />}
    </ContentDetailResolver>
  )
}
