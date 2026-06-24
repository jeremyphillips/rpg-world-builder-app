import type { EquipmentKind } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { serviceFormFieldGroup } from '../../services/lib/service-form-fields'
import { mountFormFieldGroup } from '../../mounts/lib/mount-form-fields'
import { toolFormFieldGroup } from '../../tools/lib/tool-form-fields'
import { magicItemFormFieldGroup } from '../../magic-items/lib/magic-item-form-fields'

export { visibleWhenKind } from './visible-when-kind'

/** Extracted per-family form groups — monolith groups are removed as each kind registers here. */
export const kindFieldGroups: Partial<Record<EquipmentKind, () => FormItem[]>> = {
  service: () => [serviceFormFieldGroup()],
  mount: () => [mountFormFieldGroup()],
  tool: () => [toolFormFieldGroup()],
  magic_item: () => [magicItemFormFieldGroup()],
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
