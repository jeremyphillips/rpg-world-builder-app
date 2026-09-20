import {
  formatSpellSlotLevelLabel,
  MAX_SPELL_SLOT_LEVEL,
  resolveChoiceProgressionQuotaAtLevel,
  resolveDisplayChoiceColumns,
  resolveDisplaySlotRowAtLevel,
  type SlotProgression,
  type SpellcastingProfile,
} from '@rpg/contracts'

import {
  withTierSeparatorAfterStandardMax,
  type TableGridPresentation,
} from '@/lib/content-table-surface'

export function buildCombinedSpellcastingPreviewPresentation(input: {
  profile: SpellcastingProfile
  slotProgression: SlotProgression | undefined
  effectiveMaxLevel: number
  standardMaxLevel?: number
  extendedTierName?: string
}): TableGridPresentation {
  const choiceColumns = resolveDisplayChoiceColumns(input.profile)
  const slotColumns = Array.from({ length: MAX_SPELL_SLOT_LEVEL }, (_, index) => ({
    key: `slot-${index + 1}`,
    label: formatSpellSlotLevelLabel(index + 1),
  }))

  const columns = [
    ...choiceColumns.map((progression) => ({
      key: progression.id,
      label: progression.presentation?.column?.label ?? progression.id,
    })),
    ...(input.slotProgression ? slotColumns : []),
  ]

  const rows = Array.from({ length: input.effectiveMaxLevel }, (_, index) => {
    const level = index + 1
    const cells: Record<string, string | number | undefined> = Object.fromEntries(
      choiceColumns.map((progression) => [
        progression.id,
        resolveChoiceProgressionQuotaAtLevel(progression, level),
      ]),
    )

    if (input.slotProgression) {
      const slots = resolveDisplaySlotRowAtLevel(input.slotProgression, level)
      slots.forEach((count, slotIndex) => {
        cells[`slot-${slotIndex + 1}`] = count > 0 ? count : undefined
      })
    }

    return { rowHeader: level, cells }
  })

  const presentation: TableGridPresentation = { columns, rows }

  if (
    input.standardMaxLevel !== undefined &&
    input.extendedTierName &&
    input.effectiveMaxLevel > input.standardMaxLevel
  ) {
    return {
      ...presentation,
      rows: withTierSeparatorAfterStandardMax(
        presentation.rows,
        input.standardMaxLevel,
        input.extendedTierName,
      ),
    }
  }

  return presentation
}
