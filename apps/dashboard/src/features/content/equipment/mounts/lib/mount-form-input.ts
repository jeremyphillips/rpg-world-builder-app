import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import { equipmentInputBase, type EquipmentInputBuildCtx } from '../../lib/equipment-form-input'

/** Maps mount form values to a create/update API input fragment. */
export function buildMountInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'mount',
    carryingCapacity: { value: values.carryingCapacity ?? 0, unit: 'lb' },
    ...(weight && { weight }),
    ...(values.speed && { speed: values.speed }),
  })
}
