import { defineMessage, formatFieldMessage } from '../../../../validation/define-message'
import type { CharacterBuildAdvisory } from '../../../character-builder/build-advisory'

// ---------------------------------------------------------------------------
// Character build advisory messages — non-blocking build consequences.
// Derived from advisory facts; distinct from blocking validation messages.
// See docs/validation-messages.md.
// ---------------------------------------------------------------------------

export const characterBuilderAdvisoryMessages = {
  notProficientWeapon: defineMessage(
    'validation.characterBuilderAdvisory.notProficientWeapon',
    () => 'Not proficient with this weapon',
  ),
  notProficientArmor: defineMessage(
    'validation.characterBuilderAdvisory.notProficientArmor',
    () => 'Not proficient with this armor',
  ),
  notProficientShield: defineMessage(
    'validation.characterBuilderAdvisory.notProficientShield',
    () => 'Not proficient with this shield',
  ),
}

const NOT_PROFICIENT_MESSAGES = {
  weapon: characterBuilderAdvisoryMessages.notProficientWeapon,
  armor: characterBuilderAdvisoryMessages.notProficientArmor,
  shield: characterBuilderAdvisoryMessages.notProficientShield,
} as const

export function resolveCharacterBuildAdvisoryMessage(advisory: CharacterBuildAdvisory): string {
  switch (advisory.code) {
    case 'equipment_not_proficient':
      return formatFieldMessage(NOT_PROFICIENT_MESSAGES[advisory.subject.equipmentClass]())
  }
}
