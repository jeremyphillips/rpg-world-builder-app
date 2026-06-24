import type { EquipmentKind } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { serviceFormFieldGroup } from '../../services/lib/service-form-fields'

export { visibleWhenKind } from './visible-when-kind'

/** Extracted per-family form groups — monolith groups are removed as each kind registers here. */
export const kindFieldGroups: Partial<Record<EquipmentKind, () => FormItem[]>> = {
  service: () => [serviceFormFieldGroup()],
}

/** Returns registered field groups for a kind, or `undefined` when still in the monolith. */
export function fieldGroupsForEquipmentKind(kind: EquipmentKind): FormItem[] | undefined {
  return kindFieldGroups[kind]?.()
}

/** All registered kind groups for the unscoped (hub) form. */
export function allRegisteredKindFieldGroups(): FormItem[] {
  return (Object.keys(kindFieldGroups) as EquipmentKind[]).flatMap((kind) =>
    kindFieldGroups[kind]!(),
  )
}
