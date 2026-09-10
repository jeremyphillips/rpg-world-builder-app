import { useFormContext, useWatch, type FieldValues } from 'react-hook-form'
import { Modal } from '@rpg/ui'

import { useCampaignRules } from '@/features/campaign'
import { getContentImageUrl } from '../../detail/page/content-image-url'
import { ClassDetailBody } from '../../../classes/components/detail/class-detail-body'
import { useSubclasses } from '../../../classes/hooks/use-subclasses'
import type { ClassDetailViewModel } from '../../../classes/lib/class-display'
import { useSkillProficiencies } from '../../../skill-proficiencies/hooks/use-skill-proficiencies'
import type { AnyContentFormDef, ContentFormCtx } from '../registry/content-form-registry'
import { CONTENT_PREVIEW_AS_PLAYER_LABEL } from './content-form-preview-copy'

export function ContentPreviewPlayerHost({
  def,
  ctx,
  open,
  onOpenChange,
}: {
  def: AnyContentFormDef
  ctx: ContentFormCtx
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { getValues } = useFormContext<FieldValues>()
  const values = (useWatch() ?? getValues()) as FieldValues
  const detail = def.preview?.buildPreviewDetail(values, ctx)
  const campaignRules = useCampaignRules(ctx.campaignId)
  const { data: subclasses = [] } = useSubclasses(
    def.routeKey === 'classes' ? ctx.campaignId : undefined,
    def.routeKey === 'classes' ? ctx.entityId : undefined,
  )
  const { data: skillProficiencies = [], isPending: skillsPending } = useSkillProficiencies(
    ctx.campaignId,
  )

  if (!detail || def.routeKey !== 'classes') {
    return (
      <Modal.Root open={open} onOpenChange={onOpenChange}>
        <Modal.Content size="xl" layout="stable" stableSize="tall" closeLabel="Close preview">
          <Modal.Header headline={CONTENT_PREVIEW_AS_PLAYER_LABEL} />
          <Modal.Body />
        </Modal.Content>
      </Modal.Root>
    )
  }

  const viewModel = detail.viewModel as ClassDetailViewModel
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
            name={detail.name}
            imageUrl={getContentImageUrl()}
            imageName={detail.name}
            viewModel={viewModel}
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
