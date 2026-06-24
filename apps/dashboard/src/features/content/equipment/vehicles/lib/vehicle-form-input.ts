import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-input-base'

type VehicleInput = Extract<CreateEquipmentInput, { kind: 'vehicle' }>

function optionalVehicleFields(values: EquipmentInputBuildCtx['values']): Partial<VehicleInput> {
  return {
    ...(values.speed && { speed: values.speed }),
    ...(values.vehicleCapacity !== undefined && {
      capacity: { value: values.vehicleCapacity, unit: 'lb' },
    }),
    ...(values.crew !== undefined && { crew: values.crew }),
    ...(values.passengers !== undefined && { passengers: values.passengers }),
    ...(values.cargoTons !== undefined && { cargoTons: values.cargoTons }),
    ...(values.ac !== undefined && { ac: values.ac }),
    ...(values.hp !== undefined && { hp: values.hp }),
    ...(values.damageThreshold !== undefined && { damageThreshold: values.damageThreshold }),
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
