import {
  equipmentAdvisoryClass,
  resolveEquipmentNotProficientMessage,
  resolveEquipmentNotProficientShortLabel,
  type Equipment,
} from '@rpg/contracts'

import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'

/** When isProficient is false and equipment has an advisory class, returns 0–1 warning badges. */
export function resolveEquipmentNotProficientCompatibilityStatus(
  equipment: Equipment,
  isProficient: boolean,
): EntitySummaryStatusItem[] {
  if (isProficient) return []
  const equipmentClass = equipmentAdvisoryClass(equipment)
  if (!equipmentClass) return []
  const detail = resolveEquipmentNotProficientMessage(equipmentClass)
  return [
    {
      kind: 'badge',
      label: resolveEquipmentNotProficientShortLabel(),
      tone: 'warning',
      appearance: 'soft',
      title: detail,
    },
  ]
}
