import { type CreateEquipmentInput, type MagicItemEquipment } from '@rpg/contracts'

import {
  equipmentInputBase,
  parseEquipmentCreateInput,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { MagicItemEquipmentFormValues } from '../../lib/equipment-form-fields'

export function magicItemFormValuesFromEntity(
  item: MagicItemEquipment,
): Pick<
  MagicItemEquipmentFormValues,
  'rarity' | 'requiresAttunement' | 'attunementRequirement' | 'magicItemCategory'
> {
  return {
    rarity: item.rarity,
    requiresAttunement: item.requiresAttunement,
    attunementRequirement: item.attunementRequirement,
    magicItemCategory: item.magicItemCategory,
  }
}

/** Maps magic item form values to a create/update API input fragment. */
export function buildMagicItemInput({
  values,
  ctx,
  weight,
  validationIntent = 'publish',
}: EquipmentInputBuildCtx<'magic_item'>): CreateEquipmentInput {
  return parseEquipmentCreateInput(
    {
      ...equipmentInputBase(values, ctx, validationIntent),
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
    },
    validationIntent,
  )
}
