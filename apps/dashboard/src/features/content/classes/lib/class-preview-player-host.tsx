import { Modal } from '@rpg/ui'

import { useCampaignRules } from '@/features/campaign'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import type { ContentPreviewPlayerPreviewProps } from '../../lib/forms/preview/content-form-preview.types'
import { CONTENT_PREVIEW_AS_PLAYER_LABEL } from '../../lib/forms/preview/content-form-preview-copy'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { ClassDetailBody } from '../components/detail/class-detail-body'
import { useSubclasses } from '../hooks/use-subclasses'
import type { ClassDetailViewModel } from './class-display'
import { buildClassPreviewDetailViewModel } from './class-preview-projection'
import type { ClassFormValues } from './class-form-fields'

export function ClassPreviewPlayerHost({
  values,
  ctx,
  open,
  onOpenChange,
}: ContentPreviewPlayerPreviewProps<ClassFormValues>) {
  const campaignRules = useCampaignRules(ctx.campaignId)
  const { data: subclasses = [] } = useSubclasses(ctx.campaignId, ctx.entityId)
  const { data: skillProficiencies = [], isPending: skillsPending } = useSkillProficiencies(
    ctx.campaignId,
  )

  const name = values.name?.trim() || 'Unnamed class'
  const viewModel = buildClassPreviewDetailViewModel(values, ctx)
  const vocabulary = {
    resolveToolLabel: (slug: string) =>
      slug
        .split('-')
        .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
        .join(' '),
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="xl" layout="stable" stableSize="tall" closeLabel="Close preview">
        <Modal.Header headline={CONTENT_PREVIEW_AS_PLAYER_LABEL} />
        <Modal.Body>
          <ClassDetailBody
            name={name}
            imageUrl={getContentImageUrl()}
            imageName={name}
            viewModel={viewModel as ClassDetailViewModel}
            subclasses={subclasses}
            subclassingEnabled={campaignRules.subclassing.enabled}
            campaignId={ctx.campaignId ?? ''}
            skillProficiencies={skillProficiencies}
            skillsPending={skillsPending}
            vocabulary={vocabulary}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
