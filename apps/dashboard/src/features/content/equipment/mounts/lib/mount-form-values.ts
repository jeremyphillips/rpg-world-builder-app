import {
  createEquipmentInputSchema,
  type CreateEquipmentInput,
  type MountEquipment,
} from '@rpg/contracts'

import {
  massFromForm,
  massToForm,
  speedRateFromForm,
} from '../../../lib/content-form-field-helpers'
import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { EquipmentFormValues } from '../../lib/equipment-form-fields'

export function mountFormValuesFromEntity(
  item: MountEquipment,
): Pick<EquipmentFormValues, 'carryingCapacity' | 'speed'> {
  return {
    carryingCapacity: massToForm(item.carryingCapacity),
    speed: item.speed,
  }
}

/** Maps mount form values to a create/update API input fragment. */
export function buildMountInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  const carryingCapacity = massFromForm(values.carryingCapacity)
  const speed = speedRateFromForm(values.speed)
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'mount',
    carryingCapacity: carryingCapacity ?? { value: 0, unit: 'lb' },
    speed,
    ...(weight && { weight }),
  })
}
