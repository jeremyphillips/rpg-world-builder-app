import { useParams } from 'react-router-dom'
import { Heading, RichTextContent } from '@rpg/ui'
import type { Feat } from '@rpg/contracts'

import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { WidePage } from '@/components/layout/page/wide-page'
import { useFeats } from '../hooks/use-feats'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import { ContentUsageReferencesSection } from '../../lib/usage/content-usage-references-section'
import { buildFeatDetailViewModel } from '../lib/feat-display'

type FeatDetailContentProps = {
  feat: Feat
  campaignId: string
}

export function FeatDetailContent({ feat, campaignId }: FeatDetailContentProps) {
  useSetBreadcrumbLabel(feat.name)
  const viewModel = buildFeatDetailViewModel(feat)

  return (
    <WidePage>
      <ContentDetailLayout
        name={feat.name}
        nameBadge={<ContentStatusNameBadge status={feat.status} />}
        imageUrl={getContentImageUrl(feat.imageKey)}
        imageName={feat.name}
        campaignId={campaignId}
        editHref={contentEditHref('feats', campaignId, feat.id)}
        statRows={viewModel.statRows}
        descriptionContent={
          viewModel.description ? (
            <RichTextContent html={viewModel.description} size="md" tone="muted" />
          ) : undefined
        }
      >
        {viewModel.repeatableNotes && (
          <section aria-labelledby="feat-repeatable-notes-heading">
            <Heading variant="section" as="h2" id="feat-repeatable-notes-heading" className="mb-3">
              Repeatable
            </Heading>
            <RichTextContent html={viewModel.repeatableNotes} size="md" tone="muted" />
          </section>
        )}
        <ContentUsageReferencesSection
          campaignId={campaignId}
          routeKey="feats"
          entityId={feat.id}
        />
      </ContentDetailLayout>
    </WidePage>
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
