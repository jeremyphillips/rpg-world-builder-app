import { useParams } from 'react-router-dom'
import type { Equipment } from '@rpg/contracts'
import { formatMoney, getEquipmentKindLabel } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useEquipment } from '../hooks/use-equipment'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { ContentDetailStatBody } from '../../lib/content-detail-stat-body'
import { contentEditHref } from '../../lib/content-edit-href'
import type { ContentStatRowData } from '../../lib/content-stat-rows'
import { getContentImageUrl } from '../../lib/content-image-url'
import { getEquipmentKindStatRows } from '../lib/shared/equipment-detail-stat-rows'

type StatRow = ContentStatRowData

type EquipmentDetailContentProps = {
  item: Equipment
  campaignId: string
}

export function EquipmentDetailContent({ item, campaignId }: EquipmentDetailContentProps) {
  useSetBreadcrumbLabel(item.name)

  const statRows: StatRow[] = [
    { label: 'Kind', value: getEquipmentKindLabel(item.kind) },
    { label: 'Cost', value: formatMoney(item.cost) },
    ...getEquipmentKindStatRows(item),
  ]

  return (
    <ContentDetailLayout
      imageUrl={getContentImageUrl(item.imageKey)}
      imageName={item.name}
      campaignId={campaignId}
      editHref={contentEditHref('equipment', campaignId, item.id)}
    >
      <ContentDetailStatBody name={item.name} statRows={statRows} description={item.description} />
    </ContentDetailLayout>
  )
}

export function EquipmentDetail() {
  const { campaignId = '', equipmentId = '' } = useParams<{
    campaignId: string
    equipmentId: string
  }>()
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={equipment}
      itemId={equipmentId}
      loadErrorLabel="Could not load equipment."
      notFoundLabel="Equipment not found."
    >
      {(item) => <EquipmentDetailContent item={item} campaignId={campaignId} />}
    </ContentDetailResolver>
  )
}
