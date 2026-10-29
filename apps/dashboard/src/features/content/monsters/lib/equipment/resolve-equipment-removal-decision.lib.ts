import {
  findActionsReferencingEntry,
  type MonsterEquipmentActionReference,
} from '../actions/monster-action-equipment-references'
import type { MonsterEquipmentFormEntry, MonsterFormValues } from '../monster-form-values'
import { equipmentEntryHasMeaningfulCustomization } from './equipment-entry-customization.lib'

export { equipmentEntryHasMeaningfulCustomization } from './equipment-entry-customization.lib'

export type EquipmentRemovalReason = 'customized' | 'referenced'

/** `prohibited` is a hard stop. It must not be stored as a confirmable removal. */
export type EquipmentRemovalOutcome = 'allowed' | 'confirm' | 'prohibited'

export type EquipmentRemovalDecision = {
  outcome: EquipmentRemovalOutcome
  reasons: EquipmentRemovalReason[]
  references: MonsterEquipmentActionReference[]
}

export function resolveEquipmentRemovalDecision(
  values: MonsterFormValues,
  entry: MonsterEquipmentFormEntry,
): EquipmentRemovalDecision {
  const references = findActionsReferencingEntry(values, entry.entryId)
  const customized = equipmentEntryHasMeaningfulCustomization(entry)
  const reasons: EquipmentRemovalReason[] = []
  if (customized) reasons.push('customized')
  if (references.length > 0) reasons.push('referenced')
  if (reasons.length === 0) {
    return { outcome: 'allowed', reasons, references }
  }
  return { outcome: 'confirm', reasons, references }
}
