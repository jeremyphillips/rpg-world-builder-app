export const LEGENDARY_ACQUISITION_CATEGORIES = [
  'reference',
  'spellcasting',
  'cast-spell',
] as const satisfies readonly ['reference', 'spellcasting', 'cast-spell']

export const LEGENDARY_EDITOR_ONLY_CATEGORIES = ['custom'] as const

export const LEGENDARY_ACTION_CATEGORIES = [
  ...LEGENDARY_ACQUISITION_CATEGORIES,
  ...LEGENDARY_EDITOR_ONLY_CATEGORIES,
] as const

export type LegendaryAcquisitionCategory = (typeof LEGENDARY_ACQUISITION_CATEGORIES)[number]

export type LegendaryActionCategory = (typeof LEGENDARY_ACTION_CATEGORIES)[number]

export const LEGENDARY_ACQUISITION_OPTION_ID = {
  reference: 'legendary:reference',
  spellcasting: 'legendary:spellcasting',
  'cast-spell': 'legendary:cast-spell',
} as const satisfies Record<LegendaryAcquisitionCategory, `legendary:${string}`>

const LEGENDARY_ACQUISITION_CATEGORY_SET: ReadonlySet<string> = new Set(
  LEGENDARY_ACQUISITION_CATEGORIES,
)

export function isLegendaryAcquisitionCategory(
  value: string,
): value is LegendaryAcquisitionCategory {
  return LEGENDARY_ACQUISITION_CATEGORY_SET.has(value)
}

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
