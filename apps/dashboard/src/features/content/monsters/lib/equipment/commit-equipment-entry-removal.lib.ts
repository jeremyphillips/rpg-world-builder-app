import type { UseFormReturn } from 'react-hook-form'

import {
  findActionsReferencingEntry,
  MONSTER_ACTION_SECTIONS,
  removeEquipmentEntryWithDependents,
} from '../actions/monster-action-equipment-references'
import type { MonsterFormValues } from '../monster-form-values'

/** Applies equipment + dependent weapon-action removal without a full form reset. */
export function commitEquipmentEntryRemoval(
  form: UseFormReturn<MonsterFormValues>,
  entryId: string,
): void {
  const current = form.getValues()
  const next = removeEquipmentEntryWithDependents(current, entryId)
  form.setValue('equipment', next.equipment, { shouldDirty: true })
  if (findActionsReferencingEntry(current, entryId).length === 0) return
  for (const section of MONSTER_ACTION_SECTIONS) {
    form.setValue(section, next[section], { shouldDirty: true })
  }
}
