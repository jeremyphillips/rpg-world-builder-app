import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import { equipmentInputBase, type EquipmentInputBuildCtx } from '../../lib/equipment-form-input'

/** Maps tool form values to a create/update API input fragment. */
export function buildToolInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'tool',
    toolCategory: values.toolCategory ?? 'other',
    ...(weight && { weight }),
    ...(values.ability && { ability: values.ability }),
  })
}
