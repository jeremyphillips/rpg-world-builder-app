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
import type { ContentPreviewPlayerPreviewProps } from '../../lib/forms/preview/content-form-preview.types'
import { CONTENT_PREVIEW_AS_PLAYER_LABEL } from '../../lib/forms/preview/content-form-preview-copy'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { ClassDetailBody } from '../components/detail/class-detail-body'
import { useSubclasses } from '../hooks/use-subclasses'
import type { ClassDetailViewModel } from './class-display'
import { buildClassPreviewDetailViewModel } from './class-preview-projection'
import type { ClassFormValues } from './class-form-fields'

const PREVIEW_TOOL_LABEL_VOCABULARY = {
  resolveToolLabel: (slug: string) =>
    slug
      .split('-')
      .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
      .join(' '),
}

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
        rulesetId: ctx.rulesetId,
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
  const campaignRules = useCampaignRules(ctx.campaignId)
  const subclassesQuery = useSubclasses(ctx.campaignId, ctx.entityId)
  const skillsQuery = useSkillProficiencies(ctx.campaignId)
  const subclassesEnabled = Boolean(ctx.campaignId && ctx.entityId)
  const skillsEnabled = Boolean(ctx.campaignId)

  const name = values.name?.trim() || 'Unnamed class'
  const viewModel = buildClassPreviewDetailViewModel(values, ctx)

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
        viewModel={viewModel as ClassDetailViewModel}
        subclasses={subclassesQuery.data ?? []}
        subclassesPending={subclassesEnabled && subclassesQuery.isPending}
        subclassesLoadingError={subclassesEnabled && subclassesQuery.isLoadingError}
        subclassingEnabled={campaignRules.subclassing.enabled}
        campaignId={ctx.campaignId ?? ''}
        skillProficiencies={skillsQuery.data ?? []}
        skillsPending={skillsEnabled && skillsQuery.isPending}
        skillsLoadingError={skillsEnabled && skillsQuery.isLoadingError}
        vocabulary={PREVIEW_TOOL_LABEL_VOCABULARY}
        pageShell={false}
      />
    </DetailPreviewModal>
  )
}
