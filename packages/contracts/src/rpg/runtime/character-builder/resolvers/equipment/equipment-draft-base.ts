import type { CharacterBuilderDraft } from '../../draft'

const EMPTY_EQUIPMENT_DRAFT = {
  mode: 'package' as const,
  purchases: [],
  removedPackageItemKeys: [],
  customized: false,
  magicItemSelections: [],
}

/** Clones the equipment draft channel with defaults for missing fields. */
export function cloneEquipmentDraftChannel(
  draft: CharacterBuilderDraft,
  overrides: Partial<NonNullable<CharacterBuilderDraft['equipment']>> = {},
): NonNullable<CharacterBuilderDraft['equipment']> {
  return {
    ...EMPTY_EQUIPMENT_DRAFT,
    ...draft.equipment,
    ...overrides,
  }
}
