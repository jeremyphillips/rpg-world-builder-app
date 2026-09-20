import { TableGrid } from '@/lib/content-table-surface'

import { buildCombinedSpellcastingPreviewPresentation } from '../lib/rules/character-configuration/spellcasting-combined-preview.lib'
import type { SlotProgression, SpellcastingProfile } from '@rpg/contracts'
import { spellcastingCombinedPreviewWrapClasses } from './spellcasting-progression-field.variants'

export type SpellcastingCombinedPreviewProps = {
  profile: SpellcastingProfile
  slotProgression: SlotProgression | undefined
  effectiveMaxLevel: number
  standardMaxLevel?: number
  extendedTierName?: string
  caption?: string
}

export function SpellcastingCombinedPreview({
  profile,
  slotProgression,
  effectiveMaxLevel,
  standardMaxLevel,
  extendedTierName,
  caption = 'Combined progression preview',
}: SpellcastingCombinedPreviewProps) {
  const presentation = buildCombinedSpellcastingPreviewPresentation({
    profile,
    slotProgression,
    effectiveMaxLevel,
    standardMaxLevel,
    extendedTierName,
  })

  if (presentation.columns.length === 0) {
    return null
  }

  return (
    <div className={spellcastingCombinedPreviewWrapClasses}>
      <TableGrid
        presentation={presentation}
        caption={caption}
        rowHeaderLabel="Level"
        scrollMode="embedded"
      />
    </div>
  )
}
