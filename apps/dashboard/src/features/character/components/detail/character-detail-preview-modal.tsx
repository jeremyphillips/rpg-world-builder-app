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
  /** When set, replaces the default preview completeness notice. */
  previewNotice?: string
}

export function CharacterDetailPreviewModal({
  open,
  onOpenChange,
  headline,
  viewModel,
  completeness,
  previewNotice,
}: CharacterDetailPreviewModalProps) {
  const notice =
    previewNotice ?? (completeness.showPreviewNotice ? CHARACTER_DETAIL_PREVIEW_NOTICE : undefined)

  return (
    <DetailPreviewModal open={open} onOpenChange={onOpenChange} headline={headline}>
      {notice ? (
        <Text variant="muted" className={characterDetailPreviewNoticeClasses()}>
          {notice}
        </Text>
      ) : null}
      <CharacterDetailSheet viewModel={viewModel} />
    </DetailPreviewModal>
  )
}
