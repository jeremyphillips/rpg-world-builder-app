import { DetailPreviewModal } from '@rpg/ui'

import { useDamageTypeVocabulary, useSpellSchoolVocabulary } from '@/features/vocabulary'
import { contentAuthoringCampaignIdForQueries } from '../../lib/authoring/content-authoring-scope.lib'
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
  const queryCampaignId = contentAuthoringCampaignIdForQueries(ctx)
  const { vocabulary: damageTypeVocabulary } = useDamageTypeVocabulary(queryCampaignId)
  const { vocabulary: spellSchoolVocabulary } = useSpellSchoolVocabulary(queryCampaignId)

  const name = values.name?.trim() || 'Unnamed spell'
  const viewModel = buildSpellPreviewDetailViewModel(values, {
    ...ctx,
    damageTypeVocabulary,
    spellSchoolVocabulary,
  })

  return (
    <DetailPreviewModal
      open={open}
      onOpenChange={onOpenChange}
      headline={CONTENT_PREVIEW_AS_PLAYER_LABEL}
    >
      <SpellDetailBody
        name={name}
        imageName={name}
        viewModel={viewModel}
        campaignId={queryCampaignId}
      />
    </DetailPreviewModal>
  )
}
