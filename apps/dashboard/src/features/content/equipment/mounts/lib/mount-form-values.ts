import { type CreateEquipmentInput, type MountEquipment } from '@rpg/contracts'

import {
  massFromForm,
  massToForm,
  speedRateFromForm,
} from '../../../lib/forms/fields/content-speed-form-fields'
import {
  equipmentInputBase,
  parseEquipmentCreateInput,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { MountEquipmentFormValues } from '../../lib/equipment-form-fields'

export function mountFormValuesFromEntity(
  item: MountEquipment,
): Pick<MountEquipmentFormValues, 'carryingCapacity' | 'speed'> {
  return {
    carryingCapacity: massToForm(item.carryingCapacity) ?? { value: 0, unit: 'lb' },
    speed: item.speed,
  }
}

/** Maps mount form values to a create/update API input fragment. */
export function buildMountInput({
  values,
  ctx,
  weight,
  validationIntent = 'publish',
}: EquipmentInputBuildCtx<'mount'>): CreateEquipmentInput {
  const carryingCapacity = massFromForm(values.carryingCapacity)
  const speed = speedRateFromForm(values.speed)
  const isDraft = validationIntent === 'draft'

  return parseEquipmentCreateInput(
    {
      ...equipmentInputBase(values, ctx, validationIntent),
      kind: 'mount',
      ...(carryingCapacity
        ? { carryingCapacity }
        : isDraft
          ? {}
          : { carryingCapacity: { value: 0, unit: 'lb' as const } }),
      ...(speed ? { speed } : isDraft ? {} : { speed }),
      ...(weight && { weight }),
    },
    validationIntent,
  )
}
