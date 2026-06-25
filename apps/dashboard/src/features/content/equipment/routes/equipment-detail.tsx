import { useParams } from 'react-router-dom'
import type { Equipment } from '@rpg/contracts'
import { formatMoney, getEquipmentKindLabel } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import { useEquipment } from '../hooks/use-equipment'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { ContentDetailStatBody } from '../../lib/content-detail-stat-body'
import { contentEditHref } from '../../lib/content-edit-href'
import type { ContentStatRowData } from '../../lib/content-stat-rows'
import { getContentImageUrl } from '../../lib/content-image-url'
import { getEquipmentKindStatRows } from '../lib/shared/equipment-detail-stat-rows'
import { EquipmentFamilyMismatchAlert } from '../lib/shared/equipment-family-mismatch-alert'
import { shouldShowEquipmentFamilyMismatch } from '../lib/shared/equipment-family-route-guard'
import {
  familyPathToEquipmentKind,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

type StatRow = ContentStatRowData

type EquipmentDetailContentProps = {
  item: Equipment
  campaignId: string
  family: EquipmentFamilyPath
}

export function EquipmentDetailContent({ item, campaignId, family }: EquipmentDetailContentProps) {
  useSetBreadcrumbLabel(item.name)

  const statRows: StatRow[] = [
    { label: 'Kind', value: getEquipmentKindLabel(item.kind) },
    { label: 'Cost', value: formatMoney(item.cost) },
    ...getEquipmentKindStatRows(item),
  ]

  return (
    <WidePage>
      <ContentDetailLayout
        imageUrl={getContentImageUrl(item.imageKey)}
        imageName={item.name}
        campaignId={campaignId}
        editHref={contentEditHref('equipment', campaignId, item.id, family)}
      >
        <ContentDetailStatBody
          name={item.name}
          statRows={statRows}
          description={item.description}
        />
      </ContentDetailLayout>
    </WidePage>
  )
}

type EquipmentDetailProps = {
  family: EquipmentFamilyPath
}

export function EquipmentDetail({ family }: EquipmentDetailProps) {
  const { campaignId = '', equipmentId = '' } = useParams<{
    campaignId: string
    equipmentId: string
  }>()
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)
  const expectedKind = familyPathToEquipmentKind(family)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={equipment}
      itemId={equipmentId}
      loadErrorLabel="Could not load equipment."
      notFoundLabel="Equipment not found."
    >
      {(item) =>
        shouldShowEquipmentFamilyMismatch(item, expectedKind, false, false) ? (
          <EquipmentFamilyMismatchAlert />
        ) : (
          <EquipmentDetailContent item={item} campaignId={campaignId} family={family} />
        )
      }
    </ContentDetailResolver>
  )
}
