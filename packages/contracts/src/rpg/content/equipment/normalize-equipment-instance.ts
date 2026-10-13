import type { EquipmentMechanicalEffect } from './effect'
import type { EquipmentInstance } from './instance'
import type { EquipmentModifier } from './modifier'

const LEGACY_AC_EFFECT_ID = 'legacy-armor-class-modifier'

function stripLegacyArmorClassModifiers(modifiers: readonly EquipmentModifier[] | undefined): {
  modifiers: EquipmentModifier[] | undefined
  legacyAcBonus: number | undefined
} {
  if (!modifiers?.length) return { modifiers: undefined, legacyAcBonus: undefined }
  const armorMods = modifiers.filter((modifier) => modifier.kind === 'armor_class')
  const rest = modifiers.filter((modifier) => modifier.kind !== 'armor_class')
  const legacyAcBonus =
    armorMods.length > 0
      ? armorMods.reduce(
          (total, modifier) => (modifier.kind === 'armor_class' ? total + modifier.bonus : total),
          0,
        )
      : undefined
  return {
    modifiers: rest.length > 0 ? rest : undefined,
    legacyAcBonus: legacyAcBonus === 0 ? undefined : legacyAcBonus,
  }
}

function mergeLegacyAcIntoMechanicalEffects(
  entry: EquipmentInstance,
  legacyAcBonus: number | undefined,
): EquipmentMechanicalEffect[] | undefined {
  const existing = entry.mechanicalEffects ?? []
  if (legacyAcBonus === undefined) {
    return existing.length > 0 ? existing : undefined
  }
  const hasAcTarget = existing.some((effect) => effect.target === 'armor_class')
  if (hasAcTarget) return existing.length > 0 ? existing : undefined
  return [
    ...existing,
    {
      effectId: LEGACY_AC_EFFECT_ID,
      target: 'armor_class',
      bonus: legacyAcBonus,
    },
  ]
}

/** Converts legacy armor_class modifiers into mechanicalEffects and strips them from modifiers. */
export function normalizeEquipmentInstance<T extends EquipmentInstance>(entry: T): T {
  const { modifiers, legacyAcBonus } = stripLegacyArmorClassModifiers(entry.modifiers)
  const mechanicalEffects = mergeLegacyAcIntoMechanicalEffects(
    { ...entry, modifiers },
    legacyAcBonus,
  )
  return {
    ...entry,
    modifiers,
    mechanicalEffects,
  }
}
