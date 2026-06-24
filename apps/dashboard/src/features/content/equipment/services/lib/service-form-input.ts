import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import { equipmentInputBase, type EquipmentInputBuildCtx } from '../../lib/equipment-form-input'

/** Maps service form values to a create/update API input fragment. */
export function buildServiceInput({ values, ctx }: EquipmentInputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'service',
    serviceCategory: values.serviceCategory ?? 'other',
    ...(values.duration && { duration: values.duration }),
    ...(values.notes && { notes: values.notes }),
  })
}
