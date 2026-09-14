import { Modal } from '@rpg/ui'

import {
  useCreatureTypeVocabulary,
  useLanguageVocabulary,
  useSenseVocabulary,
} from '@/features/vocabulary'
import { getContentImageUrl } from '../../lib/detail/page/content-image-url'
import type { ContentPreviewPlayerPreviewProps } from '../../lib/forms/preview/content-form-preview.types'
import { CONTENT_PREVIEW_AS_PLAYER_LABEL } from '../../lib/forms/preview/content-form-preview-copy'
import { SpeciesDetailBody } from '../components/detail/species-detail-body'
import type { SpeciesFormValues } from './species-form-fields'
import { buildSpeciesPreviewDetailViewModel } from './species-preview-projection'

export function SpeciesPreviewPlayerHost({
  values,
  ctx,
  open,
  onOpenChange,
}: ContentPreviewPlayerPreviewProps<SpeciesFormValues>) {
  const { vocabulary: creatureTypeVocabulary } = useCreatureTypeVocabulary(ctx.campaignId)
  const { vocabulary: senseVocabulary } = useSenseVocabulary(ctx.campaignId)
  const { vocabulary: languageVocabulary } = useLanguageVocabulary(ctx.campaignId)

  const name = values.name?.trim() || 'Unnamed species'
  const viewModel = buildSpeciesPreviewDetailViewModel(values, {
    ...ctx,
    creatureTypeVocabulary,
    senseVocabulary,
    languageVocabulary,
  })

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="xl" layout="stable" stableSize="tall" closeLabel="Close preview">
        <Modal.Header headline={CONTENT_PREVIEW_AS_PLAYER_LABEL} />
        <Modal.Body>
          <SpeciesDetailBody
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
