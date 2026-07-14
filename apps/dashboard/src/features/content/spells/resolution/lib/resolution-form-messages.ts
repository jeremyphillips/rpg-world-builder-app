import { defineMessage } from '@rpg/contracts'

// ---------------------------------------------------------------------------
// Resolution form validation messages (dashboard tier 3).
// ---------------------------------------------------------------------------

export const resolutionFormValidationMessages = {
  attackTypeRequired: defineMessage(
    'validation.spellResolutionForm.attackTypeRequired',
    () => 'Select a melee or ranged spell attack.',
  ),
  saveAbilityRequired: defineMessage(
    'validation.spellResolutionForm.saveAbilityRequired',
    () => 'Select a saving throw ability.',
  ),
  rangeDistanceRequired: defineMessage(
    'validation.spellResolutionForm.rangeDistanceRequired',
    () => 'Enter a range distance in feet.',
  ),
  damageRollRequired: defineMessage(
    'validation.spellResolutionForm.damageRollRequired',
    () => 'Enter a damage roll.',
  ),
  damageTypeRequired: defineMessage(
    'validation.spellResolutionForm.damageTypeRequired',
    () => 'Select a damage type.',
  ),
}
