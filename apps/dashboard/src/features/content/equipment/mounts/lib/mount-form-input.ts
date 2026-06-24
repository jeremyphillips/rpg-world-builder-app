import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import { massFromForm, speedRateFromForm } from '../../../lib/content-form-field-helpers'
import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-input-base'

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
