import { DetailPreviewModal, Text } from '@rpg/ui'

import { CHARACTER_DETAIL_PREVIEW_NOTICE } from '../../lib/display/character-detail-preview-copy'
import type { CharacterDetailProjectionCompleteness } from '../../lib/display/character-detail-source.lib'
import type { CharacterDetailViewModel } from '../../lib/display/character-display'
import { CharacterDetailSheet } from './character-detail-sheet'
import { characterDetailPreviewNoticeClasses } from './character-detail-preview.variants'

export type CharacterDetailPreviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: string
  viewModel: CharacterDetailViewModel
  completeness: CharacterDetailProjectionCompleteness
}

export function CharacterDetailPreviewModal({
  open,
  onOpenChange,
  headline,
  viewModel,
  completeness,
}: CharacterDetailPreviewModalProps) {
  return (
    <DetailPreviewModal open={open} onOpenChange={onOpenChange} headline={headline}>
      {completeness.showPreviewNotice ? (
        <Text variant="muted" className={characterDetailPreviewNoticeClasses()}>
          {CHARACTER_DETAIL_PREVIEW_NOTICE}
        </Text>
      ) : null}
      <CharacterDetailSheet viewModel={viewModel} />
    </DetailPreviewModal>
  )
}
