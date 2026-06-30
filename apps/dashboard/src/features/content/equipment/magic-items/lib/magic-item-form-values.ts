import {
  createEquipmentInputSchema,
  type CreateEquipmentInput,
  type MagicItemEquipment,
} from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { EquipmentFormValues } from '../../lib/equipment-form-fields'

export function magicItemFormValuesFromEntity(
  item: MagicItemEquipment,
): Pick<
  EquipmentFormValues,
  | 'rarity'
  | 'requiresAttunement'
  | 'attunementRequirement'
  | 'magicItemCategory'
  | 'baseEquipmentId'
> {
  return {
    rarity: item.rarity,
    requiresAttunement: item.requiresAttunement,
    attunementRequirement: item.attunementRequirement,
    magicItemCategory: item.magicItemCategory,
    baseEquipmentId: item.baseEquipmentId,
  }
}

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
    ...(values.requiresAttunement === true &&
      values.attunementRequirement && {
        attunementRequirement: values.attunementRequirement,
      }),
    ...(values.magicItemCategory && { magicItemCategory: values.magicItemCategory }),
    ...(values.baseEquipmentId && { baseEquipmentId: values.baseEquipmentId }),
  })
}
