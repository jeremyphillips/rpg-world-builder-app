import { useParams } from 'react-router-dom'
import type { Weapon } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useWeapons } from '../hooks/use-weapons'
import { getWeaponStatRows } from '../lib/weapon-stat-rows'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { ContentDetailStatBody } from '../../lib/content-detail-stat-body'
import { contentEditHref } from '../../lib/content-edit-href'
import { getContentImageUrl } from '../../lib/content-image-url'

type WeaponDetailContentProps = { item: Weapon; campaignId: string }

export function WeaponDetailContent({ item, campaignId }: WeaponDetailContentProps) {
  useSetBreadcrumbLabel(item.name)
  const statRows = getWeaponStatRows(item)

  return (
    <ContentDetailLayout
      imageUrl={getContentImageUrl(item.imageKey)}
      imageName={item.name}
      campaignId={campaignId}
      editHref={contentEditHref('equipment', campaignId, item.id, 'weapons')}
    >
      <ContentDetailStatBody name={item.name} statRows={statRows} description={item.description} />
    </ContentDetailLayout>
  )
}

export function WeaponDetail() {
  const { campaignId = '', weaponId = '' } = useParams<{
    campaignId: string
    weaponId: string
  }>()
  const { data: weapons = [], isPending, isError } = useWeapons(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={weapons}
      itemId={weaponId}
      loadErrorLabel="Could not load weapons."
      notFoundLabel="Weapon not found."
    >
      {(item) => <WeaponDetailContent item={item} campaignId={campaignId} />}
    </ContentDetailResolver>
  )
}
