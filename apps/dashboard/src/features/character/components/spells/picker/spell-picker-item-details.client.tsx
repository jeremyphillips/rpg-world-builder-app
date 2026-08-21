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
    <SpellDetailMetadata
      viewModel={viewModel}
      sectionId={`${item.spell.id}-detail-metadata`}
      omitSectionTitle
      statRowSize="sm"
    />
  )
}
