import type { CharacterImportDispositionRule } from '../adapter/character-import-disposition'

// ---------------------------------------------------------------------------
// D&D Beyond proficiency disposition registry — predictable source subtypes.
// ---------------------------------------------------------------------------

export const DND_BEYOND_PROFICIENCY_DISPOSITIONS = [
  {
    matches: (subType) => subType.endsWith('-saving-throws'),
    disposition: 'ignored',
    reason: 'resolved-from-local-content',
    targetPath: 'proficiencies.savingThrows',
    message: 'Saving throw proficiencies are resolved from the selected local class.',
  },
  {
    matches: (subType) => subType === 'simple-weapons' || subType === 'martial-weapons',
    disposition: 'ignored',
    reason: 'derived-from-class',
    targetPath: 'proficiencies.weaponCategories',
    message: 'Weapon category proficiencies are resolved from the selected local class.',
  },
] as const satisfies readonly CharacterImportDispositionRule[]

export function resolveDndBeyondProficiencyDisposition(
  subType: string,
): (typeof DND_BEYOND_PROFICIENCY_DISPOSITIONS)[number] | undefined {
  return DND_BEYOND_PROFICIENCY_DISPOSITIONS.find((rule) => rule.matches(subType))
}
