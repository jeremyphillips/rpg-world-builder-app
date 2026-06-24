import { type CreateEquipmentInput, type Equipment, type EquipmentKind } from '@rpg/contracts'

import { weightFromForm } from '../../lib/content-form-field-helpers'
import { finalizeContentInput } from '../../lib/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/content-form-registry'
import { buildArmorInput } from '../armor/lib/armor-form-input'
import { buildAdventuringGearInput } from '../adventuring-gear/lib/adventuring-gear-form-input'
import { buildMagicItemInput } from '../magic-items/lib/magic-item-form-input'
import { buildMountInput } from '../mounts/lib/mount-form-input'
import { buildServiceInput } from '../services/lib/service-form-input'
import { buildToolInput } from '../tools/lib/tool-form-input'
import { buildVehicleInput } from '../vehicles/lib/vehicle-form-input'
import { buildWeaponInput } from '../weapons/lib/weapon-form-input'

import type { EquipmentFormValues } from './equipment-form-def'
import type { EquipmentInputBuildCtx } from './equipment-form-input-base'

const kindInputBuilders: Record<
  EquipmentKind,
  (ctx: EquipmentInputBuildCtx) => CreateEquipmentInput
> = {
  weapon: buildWeaponInput,
  armor: buildArmorInput,
  adventuring_gear: buildAdventuringGearInput,
  tool: buildToolInput,
  mount: buildMountInput,
  vehicle: buildVehicleInput,
  service: buildServiceInput,
  magic_item: buildMagicItemInput,
}

/** Maps unified equipment form values to a create/update API input. */
export function equipmentFormToInput(
  values: EquipmentFormValues,
  ctx?: ContentFormInputCtx<Equipment>,
): CreateEquipmentInput {
  const kind = ctx?.equipmentKind ?? values.kind
  const weight = kind !== 'service' ? weightFromForm(values.weight) : undefined
  const input = kindInputBuilders[kind]({ values: { ...values, kind }, ctx, weight })
  return finalizeContentInput(input, ctx) as CreateEquipmentInput
}
