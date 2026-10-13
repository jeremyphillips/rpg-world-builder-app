import type { EquipmentBonusEffect } from './effect'
import type { Equipment } from '../../equipment'
import type { EquipmentInstance } from './instance'
import type { MagicPropertyDefinitionProvider } from './magic-property'
import type { EquipmentEffectTarget } from '../../../vocab/equipment/effect-target'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'
import { resolveEquipmentMagicProperties } from './resolve-equipment-magic-properties'

export type EquipmentEffectTotals = Record<EquipmentEffectTarget, number>

const EMPTY_TOTALS: EquipmentEffectTotals = {
  attack_roll: 0,
  damage_roll: 0,
  armor_class: 0,
}

function addEffectTotals(
  totals: EquipmentEffectTotals,
  effects: readonly EquipmentBonusEffect[],
): EquipmentEffectTotals {
  return effects.reduce(
    (acc, effect) => ({
      ...acc,
      [effect.target]: acc[effect.target] + effect.bonus,
    }),
    totals,
  )
}

/** Preset enhancement effects plus manual adjustments, per target. */
export function resolveEquipmentEntryEffectTotals(
  entry: EquipmentInstance,
  item: Equipment,
  provider: MagicPropertyDefinitionProvider,
): EquipmentEffectTotals {
  const normalized = normalizeEquipmentInstance(entry)
  let totals = { ...EMPTY_TOTALS }

  const magic = resolveEquipmentMagicProperties(normalized, item, provider)
  for (const preset of magic.resolved) {
    totals = addEffectTotals(totals, preset.definition.effects)
  }

  for (const effect of normalized.adjustments ?? []) {
    totals = addEffectTotals(totals, [effect])
  }

  return totals
}
