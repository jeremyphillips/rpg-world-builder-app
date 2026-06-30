import {
  createEquipmentInputSchema,
  type CreateEquipmentInput,
  type VehicleEquipment,
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

type VehicleInput = Extract<CreateEquipmentInput, { kind: 'vehicle' }>

function optionalVehicleFields(values: EquipmentInputBuildCtx['values']): Partial<VehicleInput> {
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
  EquipmentFormValues,
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
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'vehicle',
    vehicleCategory: values.vehicleCategory ?? 'other',
    ...(weight && { weight }),
    ...optionalVehicleFields(values),
  })
}
