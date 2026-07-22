import { type CreateEquipmentInput, type VehicleEquipment } from '@rpg/contracts'

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
import type { VehicleEquipmentFormValues } from '../../lib/equipment-form-fields'

type VehicleInput = Extract<CreateEquipmentInput, { kind: 'vehicle' }>

function optionalVehicleFields(
  values: EquipmentInputBuildCtx<'vehicle'>['values'],
): Partial<VehicleInput> {
  const cargoCapacity = massFromForm(values.cargoCapacity)
  const speed = speedRateFromForm(values.speed)
  return {
    speed,
    ...(cargoCapacity && { cargoCapacity }),
    ...(values.crew !== undefined && { crew: values.crew }),
    ...(values.passengers !== undefined && { passengers: values.passengers }),
    ...(values.ac !== undefined && { ac: values.ac }),
    ...(values.hp !== undefined && { hp: values.hp }),
    ...(values.damageThreshold !== undefined && { damageThreshold: values.damageThreshold }),
  }
}

export function vehicleFormValuesFromEntity(
  item: VehicleEquipment,
): Pick<
  VehicleEquipmentFormValues,
  | 'vehicleCategory'
  | 'speed'
  | 'cargoCapacity'
  | 'crew'
  | 'passengers'
  | 'ac'
  | 'hp'
  | 'damageThreshold'
> {
  return {
    vehicleCategory: item.vehicleCategory,
    speed: item.speed,
    cargoCapacity: massToForm(item.cargoCapacity),
    crew: item.crew,
    passengers: item.passengers,
    ac: item.ac,
    hp: item.hp,
    damageThreshold: item.damageThreshold,
  }
}

/** Maps vehicle form values to a create/update API input fragment. */
export function buildVehicleInput({
  values,
  ctx,
  weight,
  validationIntent = 'publish',
}: EquipmentInputBuildCtx<'vehicle'>): CreateEquipmentInput {
  const isDraft = validationIntent === 'draft'

  return parseEquipmentCreateInput(
    {
      ...equipmentInputBase(values, ctx, validationIntent),
      kind: 'vehicle',
      ...(values.vehicleCategory
        ? { vehicleCategory: values.vehicleCategory }
        : isDraft
          ? {}
          : { vehicleCategory: 'other' as const }),
      ...(weight && { weight }),
      ...optionalVehicleFields(values),
    },
    validationIntent,
  )
}
