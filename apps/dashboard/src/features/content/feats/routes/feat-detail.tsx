import { useParams } from 'react-router-dom'
import { Heading, RichTextContent } from '@rpg/ui'
import type { Feat } from '@rpg/contracts'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import { useFeats } from '../hooks/use-feats'
import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentDetailResolver } from '../../lib/content-detail-resolver'
import { ContentDetailStatBody } from '../../lib/content-detail-stat-body'
import { contentEditHref } from '../../lib/content-edit-href'
import { getContentImageUrl } from '../../lib/content-image-url'
import { buildFeatStatRows } from '../lib/feat-stat-rows'

type FeatDetailContentProps = {
  feat: Feat
  campaignId: string
}

export function FeatDetailContent({ feat, campaignId }: FeatDetailContentProps) {
  useSetBreadcrumbLabel(feat.name)
  const statRows = buildFeatStatRows(feat)

  return (
    <WidePage>
      <ContentDetailLayout
        imageUrl={getContentImageUrl(feat.imageKey)}
        imageName={feat.name}
        campaignId={campaignId}
        editHref={contentEditHref('feats', campaignId, feat.id)}
      >
        <ContentDetailStatBody
          name={feat.name}
          statRows={statRows}
          descriptionContent={
            feat.description ? (
              <RichTextContent html={feat.description} size="sm" tone="muted" />
            ) : undefined
          }
        />
        {feat.repeatable.allowed && feat.repeatable.notes && (
          <section aria-labelledby="feat-repeatable-notes-heading">
            <Heading variant="section" as="h3" id="feat-repeatable-notes-heading" className="mb-3">
              Repeatable
            </Heading>
            <RichTextContent html={feat.repeatable.notes} size="sm" tone="muted" />
          </section>
        )}
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
      loadErrorLabel="Could not load feats."
      notFoundLabel="Feat not found."
    >
      {(feat) => <FeatDetailContent feat={feat} campaignId={campaignId} />}
    </ContentDetailResolver>
  )
}
