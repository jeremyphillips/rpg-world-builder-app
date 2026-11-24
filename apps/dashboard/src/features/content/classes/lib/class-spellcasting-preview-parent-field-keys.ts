/** Root class-form keys read by `spellcastingFromClassFormWatch` — keep in sync with that adapter. */
export const CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS = [
  'hasSpellcasting',
  'grantsCantrips',
  'spellcasting',
  'spellSelectionModel',
  'spellSelectionChangePackage',
  'cantripChangePackage',
  'spellbookAcquisitionIrregular',
  'spellbookAcquisitionStarting',
  'spellbookAcquisitionPerLevel',
  'spellbookAcquisitionThroughLevel',
  'spellbookAcquisitionCurve',
] as const

export type ClassSpellcastingPreviewParentFieldKey =
  (typeof CLASS_SPELLCASTING_PREVIEW_PARENT_FIELD_KEYS)[number]