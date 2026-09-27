import { useParams } from 'react-router-dom'
import { RichTextContent } from '@rpg/ui'
import type { Feat } from '@rpg/contracts'

import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useFeats } from '../hooks/use-feats'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { ContentDetailSection } from '../../lib/detail/page/content-detail-section'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { buildFeatDetailViewModel } from '../lib/feat-display'

const FEAT_REPEATABLE_HEADING_ID = 'feat-repeatable-notes-heading'

type FeatDetailContentProps = {
  feat: Feat
  campaignId: string
}

export function FeatDetailContent({ feat, campaignId }: FeatDetailContentProps) {
  useSetBreadcrumbLabel(feat.name)
  const viewModel = buildFeatDetailViewModel(feat)

  return (
    <ContentDetailLayout
      contentTypeKey="feats"
      name={feat.name}
      nameBadge={<ContentStatusNameBadge status={feat.status} />}
      imageName={feat.name}
      campaignId={campaignId}
      editHref={contentEditHref('feats', campaignId, feat.id)}
      statRows={viewModel.statRows}
      heroDescription={false}
      descriptionContent={
        viewModel.description ? (
          <RichTextContent html={viewModel.description} size="md" tone="muted" />
        ) : undefined
      }
    >
      {viewModel.repeatableNotes ? (
        <ContentDetailSection heading="Repeatable" headingId={FEAT_REPEATABLE_HEADING_ID}>
          <RichTextContent html={viewModel.repeatableNotes} size="md" tone="muted" />
        </ContentDetailSection>
      ) : null}
      <ContentUsageReferencesSection campaignId={campaignId} routeKey="feats" entityId={feat.id} />
    </ContentDetailLayout>
  )
}

export function FeatDetail() {
  const { campaignId = '', featId = '' } = useParams<{ campaignId: string; featId: string }>()
  const { data: feats = [], isPending, isError } = useFeats(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={feats}
      itemId={featId}
      loadErrorLabel={formatContentListLoadErrorMessage('feats')}
      notFoundLabel={formatContentNotFoundMessage('feats')}
    >
      {(feat) => <FeatDetailContent feat={feat} campaignId={campaignId} />}
    </ContentDetailResolver>
  )
}
