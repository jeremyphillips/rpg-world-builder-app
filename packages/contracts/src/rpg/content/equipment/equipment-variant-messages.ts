import { defineMessage } from '../../../validation/define-message'

// ---------------------------------------------------------------------------
// Equipment variant validation messages (tier 2). Weapon, armor, and
// adventuring-gear cross-field rules surfaced on equipment authoring forms.
// ---------------------------------------------------------------------------

export const equipmentVariantValidationMessages = {
  damageDamageTypeTogether: defineMessage(
    'validation.equipmentVariant.damageDamageTypeTogether',
    () => 'Damage and damage type must both be set or both be left empty.',
  ),
  versatileDamageRequired: defineMessage(
    'validation.equipmentVariant.versatileDamageRequired',
    () => 'Versatile weapons need versatile damage dice.',
  ),
  versatileDamageForbidden: defineMessage(
    'validation.equipmentVariant.versatileDamageForbidden',
    () => 'Versatile damage is only for weapons with the Versatile property.',
  ),
  shieldAcBonusRequired: defineMessage(
    'validation.equipmentVariant.shieldAcBonusRequired',
    () => 'Shields need an AC bonus.',
  ),
  bodyArmorBaseAcRequired: defineMessage(
    'validation.equipmentVariant.bodyArmorBaseAcRequired',
    () => 'Body armor needs a base AC.',
  ),
  holySymbolUsageRequired: defineMessage(
    'validation.equipmentVariant.holySymbolUsageRequired',
    () => 'Holy symbols need at least one carrying option.',
  ),
  holySymbolUsageForbidden: defineMessage(
    'validation.equipmentVariant.holySymbolUsageForbidden',
    () => 'Holy symbol carrying options only apply to holy symbols.',
  ),
  alsoWeaponSlugForbidden: defineMessage(
    'validation.equipmentVariant.alsoWeaponSlugForbidden',
    () => 'Linked weapon slugs only apply to arcane or druidic foci.',
  ),
}
