import { useParams } from 'react-router-dom'
import { Text } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import { useEquipment } from '../hooks/use-equipment'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/content-image-url'
import { buildEquipmentDetailViewModel } from '../lib/equipment-display'
import { EquipmentFamilyMismatchAlert } from '../lib/shared/equipment-family-mismatch-alert'
import { shouldShowEquipmentFamilyMismatch } from '../lib/shared/equipment-family-route-guard'
import {
  familyPathToEquipmentKind,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

type EquipmentDetailContentProps = {
  item: Equipment
  campaignId: string
  family: EquipmentFamilyPath
}

export function EquipmentDetailContent({ item, campaignId, family }: EquipmentDetailContentProps) {
  useSetBreadcrumbLabel(item.name)

  const viewModel = buildEquipmentDetailViewModel(item)

  return (
    <WidePage>
      <ContentDetailLayout
        name={item.name}
        imageUrl={getContentImageUrl(item.imageKey)}
        imageName={item.name}
        campaignId={campaignId}
        editHref={contentEditHref('equipment', campaignId, item.id, family)}
        statRows={viewModel.statRows}
        descriptionContent={
          viewModel.description ? <Text variant="muted">{viewModel.description}</Text> : undefined
        }
      />
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
