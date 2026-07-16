'use client'

import {
  buildSpellDetailViewModel,
  SpellDetailMetadata,
  type SpellDisplayVocabulary,
} from '@/features/content'
import type { SpellPickerItem } from '@rpg/contracts'

export type SpellPickerItemDetailsProps = {
  item: SpellPickerItem
  displayVocabulary?: SpellDisplayVocabulary
}

export function SpellPickerItemDetails({ item, displayVocabulary }: SpellPickerItemDetailsProps) {
  const viewModel = buildSpellDetailViewModel(item.spell, displayVocabulary)

  return (
    <div className="px-2 pt-3">
      <SpellDetailMetadata
        viewModel={viewModel}
        sectionId={`${item.spell.id}-detail-metadata`}
        omitSectionTitle
        statRowSize="sm"
      />
    </div>
  )
}
