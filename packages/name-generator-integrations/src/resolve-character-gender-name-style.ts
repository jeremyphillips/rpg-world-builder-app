import type { NameGenderStyle } from '@rpg/contracts/name-generator'
import type { CharacterGender } from '@rpg/contracts/rpg/vocab'

/**
 * Maps character identity gender to name-generator genderStyle.
 * Character gender (`male` / `female`) is distinct from naming genderStyle
 * (`masculine` / `feminine` / `neutral` / …).
 */
export function resolveCharacterGenderNameStyle(
  gender?: CharacterGender | '' | null,
): NameGenderStyle {
  if (gender === 'male') {
    return 'masculine'
  }
  if (gender === 'female') {
    return 'feminine'
  }
  return 'neutral'
}
