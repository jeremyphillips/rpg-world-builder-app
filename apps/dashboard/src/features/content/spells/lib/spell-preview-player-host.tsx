import { Modal } from '@rpg/ui'

import { useDamageTypeVocabulary, useSpellSchoolVocabulary } from '@/features/vocabulary'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import type { ContentPreviewPlayerPreviewProps } from '../../lib/forms/preview/content-form-preview.types'
import { CONTENT_PREVIEW_AS_PLAYER_LABEL } from '../../lib/forms/preview/content-form-preview-copy'
import { SpellDetailBody } from '../components/spell-detail-body'
import type { SpellFormValues } from './spell-form-fields'
import { buildSpellPreviewDetailViewModel } from './spell-preview-projection'

export function SpellPreviewPlayerHost({
  values,
  ctx,
  open,
  onOpenChange,
}: ContentPreviewPlayerPreviewProps<SpellFormValues>) {
  const { vocabulary: damageTypeVocabulary } = useDamageTypeVocabulary(ctx.campaignId)
  const { vocabulary: spellSchoolVocabulary } = useSpellSchoolVocabulary(ctx.campaignId)

  const name = values.name?.trim() || 'Unnamed spell'
  const viewModel = buildSpellPreviewDetailViewModel(values, {
    ...ctx,
    damageTypeVocabulary,
    spellSchoolVocabulary,
  })

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="xl" layout="stable" stableSize="tall" closeLabel="Close preview">
        <Modal.Header headline={CONTENT_PREVIEW_AS_PLAYER_LABEL} />
        <Modal.Body>
          <SpellDetailBody
            name={name}
            imageUrl={getContentImageUrl()}
            imageName={name}
            viewModel={viewModel}
            campaignId={ctx.campaignId ?? ''}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
