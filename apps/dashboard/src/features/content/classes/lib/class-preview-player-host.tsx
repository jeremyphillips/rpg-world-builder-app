import { emptyContentMediaSchema } from '@rpg/contracts'
import { DetailPreviewModal } from '@rpg/ui'

import { useCampaignRules } from '@/features/campaign'
import {
  getContentDisplayImage,
  resolveDashboardDetailDisplayFallback,
} from '../../lib/detail/page/content-display-image'
import {
  buildContentDisplayImageInput,
  type ContentPreviewDisplayImageValues,
} from '../../lib/detail/page/content-display-image-input'
import {
  contentAuthoringCampaignIdForQueries,
  contentEntityArtworkRulesetId,
} from '../../lib/authoring/content-authoring-scope.lib'
import type { ContentPreviewPlayerPreviewProps } from '../../lib/forms/preview/content-form-preview.types'
import { CONTENT_PREVIEW_AS_PLAYER_LABEL } from '../../lib/forms/preview/content-form-preview-copy'
import { ClassDetailBody } from '../components/detail/class-detail-body'
import { useSubclasses } from '../hooks/use-subclasses'
import {
  buildClassPreviewDetailViewModel,
  classPreviewVocabulary,
} from './class-preview-projection'
import type { ClassFormValues } from './class-form-fields'

function classPreviewDisplayImage(
  values: ClassFormValues,
  ctx: ContentPreviewPlayerPreviewProps<ClassFormValues>['ctx'],
) {
  return getContentDisplayImage(
    buildContentDisplayImageInput(
      'classes',
      {
        media: (values as ContentPreviewDisplayImageValues).media ?? emptyContentMediaSchema,
        slug: values.slug ?? 'preview',
        catalogLayer: ctx.entityCatalogLayer ?? 'homebrew',
        rulesetId: contentEntityArtworkRulesetId(ctx),
      },
      'detail',
    ),
  )
}

export function ClassPreviewPlayerHost({
  values,
  ctx,
  open,
  onOpenChange,
}: ContentPreviewPlayerPreviewProps<ClassFormValues>) {
  const queryCampaignId = contentAuthoringCampaignIdForQueries(ctx)
  const campaignRules = useCampaignRules(queryCampaignId)
  const subclassesQuery = useSubclasses(queryCampaignId, ctx.entityId)
  const subclassesEnabled = Boolean(queryCampaignId && ctx.entityId)

  const name = values.name?.trim() || 'Unnamed class'
  const vocabulary = classPreviewVocabulary(ctx)
  const viewModel = buildClassPreviewDetailViewModel(values, vocabulary)

  return (
    <DetailPreviewModal
      open={open}
      onOpenChange={onOpenChange}
      headline={CONTENT_PREVIEW_AS_PLAYER_LABEL}
    >
      <ClassDetailBody
        name={name}
        displayImage={classPreviewDisplayImage(values, ctx)}
        displayFallback={resolveDashboardDetailDisplayFallback('class')}
        imageName={name}
        viewModel={viewModel}
        subclasses={subclassesQuery.data ?? []}
        subclassesPending={subclassesEnabled && subclassesQuery.isPending}
        subclassesLoadingError={subclassesEnabled && subclassesQuery.isLoadingError}
        subclassingEnabled={campaignRules.subclassing.enabled}
        campaignId={queryCampaignId}
        skillProficiencies={[...(ctx.skillCatalogBySlug?.values() ?? [])]}
        skillsPending={ctx.skillCatalogStatus === 'pending'}
        skillsLoadingError={ctx.skillCatalogStatus === 'error'}
        vocabulary={vocabulary}
        pageShell={false}
      />
    </DetailPreviewModal>
  )
}
