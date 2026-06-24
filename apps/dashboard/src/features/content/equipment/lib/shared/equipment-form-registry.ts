import type { EquipmentKind } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/content-form-registry'
import { serviceFormFieldGroup } from '../../services/lib/service-form-fields'
import { mountFormFieldGroup } from '../../mounts/lib/mount-form-fields'
import { toolFormFieldGroup } from '../../tools/lib/tool-form-fields'
import { magicItemFormFieldGroup } from '../../magic-items/lib/magic-item-form-fields'
import { adventuringGearFormFieldGroup } from '../../adventuring-gear/lib/adventuring-gear-form-fields'
import { vehicleFormFieldGroup } from '../../vehicles/lib/vehicle-form-fields'
import { armorFormFieldGroup } from '../../armor/lib/armor-form-fields'
import { weaponFormFieldGroup } from '../../weapons/lib/weapon-form-fields'

type KindFieldGroupBuilder = (ctx?: ContentFormCtx) => FormItem[]

/** Per-family form groups registered by kind. */
export const kindFieldGroups: Partial<Record<EquipmentKind, KindFieldGroupBuilder>> = {
  service: () => [serviceFormFieldGroup()],
  mount: () => [mountFormFieldGroup()],
  tool: () => [toolFormFieldGroup()],
  magic_item: (ctx) => [magicItemFormFieldGroup(ctx)],
  adventuring_gear: () => [adventuringGearFormFieldGroup()],
  vehicle: () => [vehicleFormFieldGroup()],
  armor: () => [armorFormFieldGroup()],
  weapon: () => [weaponFormFieldGroup()],
}

/** Returns registered field groups for a kind. */
export function fieldGroupsForEquipmentKind(
  kind: EquipmentKind,
  ctx: ContentFormCtx = {},
): FormItem[] | undefined {
  return kindFieldGroups[kind]?.(ctx)
}

/** All registered kind groups for the unscoped (hub) form. */
export function allRegisteredKindFieldGroups(): FormItem[] {
  return (Object.keys(kindFieldGroups) as EquipmentKind[]).flatMap((kind) =>
    kindFieldGroups[kind]!(),
  )
}
