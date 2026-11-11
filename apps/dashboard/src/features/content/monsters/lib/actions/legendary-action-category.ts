import type { MonsterActionDraftRow } from './monster-action-presets'

export const LEGENDARY_ACTION_CATEGORIES = [
  'reference',
  'spellcasting',
  'cast-spell',
  'custom',
] as const

export type LegendaryActionCategory = (typeof LEGENDARY_ACTION_CATEGORIES)[number]

/** UI category for a legendary row. Acquisition categories are not stored kinds. */
export function legendaryActionCategory(
  row: { kind?: string; spellInvocation?: string } | undefined,
): LegendaryActionCategory | undefined {
  if (!row) return undefined
  if (row.kind === 'action-reference') return 'reference'
  if (row.kind === 'spell' && row.spellInvocation === 'use-entry') return 'spellcasting'
  if (row.kind === 'spell') return 'cast-spell'
  if (row.kind === 'special') return 'custom'
  return undefined
}

export function isLegendaryReferenceTarget(row: MonsterActionDraftRow): boolean {
  return (
    row.kind === 'weapon' ||
    row.kind === 'natural-weapon' ||
    row.kind === 'attack' ||
    row.kind === 'save' ||
    row.kind === 'special'
  )
}
