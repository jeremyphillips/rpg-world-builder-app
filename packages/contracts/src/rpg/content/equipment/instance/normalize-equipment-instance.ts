import type { EquipmentAdjustment } from './effect'
import type { EquipmentInstance } from './instance'
import type { EquipmentModifier } from './modifier'

const LEGACY_AC_EFFECT_ID = 'legacy-armor-class-modifier'

type LegacyEquipmentInstanceInput = EquipmentInstance & {
  mechanicalEffects?: readonly EquipmentAdjustment[]
  adjustments?: readonly EquipmentAdjustment[]
}

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

function resolveBaseAdjustments(raw: LegacyEquipmentInstanceInput): EquipmentAdjustment[] {
  if (Object.prototype.hasOwnProperty.call(raw, 'adjustments')) {
    return [...(raw.adjustments ?? [])]
  }
  return [...(raw.mechanicalEffects ?? [])]
}

function mergeLegacyAcIntoAdjustments(
  baseAdjustments: EquipmentAdjustment[],
  legacyAcBonus: number | undefined,
): EquipmentAdjustment[] | undefined {
  if (legacyAcBonus === undefined) {
    return baseAdjustments.length > 0 ? baseAdjustments : undefined
  }
  const hasAcTarget = baseAdjustments.some((effect) => effect.target === 'armor_class')
  if (hasAcTarget) return baseAdjustments.length > 0 ? baseAdjustments : undefined
  return [
    ...baseAdjustments,
    {
      effectId: LEGACY_AC_EFFECT_ID,
      target: 'armor_class',
      bonus: legacyAcBonus,
    },
  ]
}

/** Converts legacy armor_class modifiers and mechanicalEffects into adjustments. */
export function normalizeEquipmentInstance<T extends EquipmentInstance>(entry: T): T {
  const raw = entry as LegacyEquipmentInstanceInput
  const { modifiers, legacyAcBonus } = stripLegacyArmorClassModifiers(raw.modifiers)
  const merged = mergeLegacyAcIntoAdjustments(resolveBaseAdjustments(raw), legacyAcBonus)
  const {
    mechanicalEffects: _legacyMechanicalEffects,
    adjustments: _legacyAdjustments,
    ...rest
  } = raw
  return {
    ...rest,
    modifiers,
    adjustments: merged,
  } as T
}
