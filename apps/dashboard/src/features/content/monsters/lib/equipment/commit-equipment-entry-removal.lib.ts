import type { UseFormReturn } from 'react-hook-form'

import { removeEquipmentEntryWithDependents } from '../actions/monster-action-equipment-references'
import type { MonsterFormValues } from '../monster-form-values'

/** Drops the equipment row. Linked weapon actions stay so the author can retarget or delete them. */
export function commitEquipmentEntryRemoval(
  form: UseFormReturn<MonsterFormValues>,
  entryId: string,
): void {
  const next = removeEquipmentEntryWithDependents(form.getValues(), entryId)
  form.setValue('equipment', next.equipment, { shouldDirty: true })
}
