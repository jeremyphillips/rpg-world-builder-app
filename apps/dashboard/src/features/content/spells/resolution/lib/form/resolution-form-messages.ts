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
  proximityDistanceRequired: defineMessage(
    'validation.spellResolutionForm.proximityDistanceRequired',
    () => 'Enter a distance in feet.',
  ),
  /** @deprecated Use proximityDistanceRequired */
  rangeDistanceRequired: defineMessage(
    'validation.spellResolutionForm.rangeDistanceRequired',
    () => 'Enter a distance in feet.',
  ),
  damageRollRequired: defineMessage(
    'validation.spellResolutionForm.damageRollRequired',
    () => 'Enter a damage roll.',
  ),
  damageTypeRequired: defineMessage(
    'validation.spellResolutionForm.damageTypeRequired',
    () => 'Select a damage type.',
  ),
  projectileCountRequired: defineMessage(
    'validation.spellResolutionForm.projectileCountRequired',
    () => 'Enter a projectile count.',
  ),
}
