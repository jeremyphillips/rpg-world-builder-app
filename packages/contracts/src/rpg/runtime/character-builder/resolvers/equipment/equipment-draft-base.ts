import type { CharacterBuilderDraft } from '../../draft/draft'

const EMPTY_EQUIPMENT_DRAFT = {
  mode: 'package' as const,
  purchases: [],
  grants: [],
  classPackage: { state: 'unresolved' as const },
  editedSincePackageSelection: false,
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
