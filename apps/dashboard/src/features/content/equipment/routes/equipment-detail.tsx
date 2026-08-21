import { useParams } from 'react-router-dom'
import { RichTextContent } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { WidePage } from '@/components/layout/page/wide-page'
import { useEquipment } from '../hooks/use-equipment'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
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
        nameBadge={<ContentStatusNameBadge status={item.status} />}
        imageUrl={getContentImageUrl(item.imageKey)}
        imageName={item.name}
        campaignId={campaignId}
        editHref={contentEditHref('equipment', campaignId, item.id, family)}
        statRows={viewModel.statRows}
        descriptionContent={
          viewModel.description ? (
            <RichTextContent html={viewModel.description} size="md" tone="muted" />
          ) : undefined
        }
      >
        <ContentUsageReferencesSection
          campaignId={campaignId}
          routeKey="equipment"
          entityId={item.id}
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
      loadErrorLabel={formatContentListLoadErrorMessage('equipment')}
      notFoundLabel={formatContentNotFoundMessage('equipment')}
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
