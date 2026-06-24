import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import { equipmentInputBase, type EquipmentInputBuildCtx } from '../../lib/equipment-form-input'

/** Maps magic item form values to a create/update API input fragment. */
export function buildMagicItemInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'magic_item',
    ...(weight && { weight }),
    ...(values.rarity && { rarity: values.rarity }),
    ...(values.requiresAttunement !== undefined && {
      requiresAttunement: values.requiresAttunement,
    }),
    ...(values.attunementRequirement && {
      attunementRequirement: values.attunementRequirement,
    }),
    ...(values.magicItemCategory && { magicItemCategory: values.magicItemCategory }),
    ...(values.baseEquipmentId && { baseEquipmentId: values.baseEquipmentId }),
  })
}
