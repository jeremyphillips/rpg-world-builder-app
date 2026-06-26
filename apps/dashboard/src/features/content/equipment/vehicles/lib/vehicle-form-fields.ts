import { VEHICLE_CATEGORIES, VEHICLE_CATEGORY_ENTRIES, type VehicleEquipment } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { massToForm, vehicleCargoSpeedFields } from '../../../lib/content-form-field-helpers'
import type { EquipmentFormValues } from '../../lib/equipment-form-def'
import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

const vehicleCategoryOptions = toOptions(
  VEHICLE_CATEGORIES,
  labelsFromEntries(VEHICLE_CATEGORY_ENTRIES),
)

/** Vehicle-specific form field group for the unified equipment form. */
export function vehicleFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Vehicle',
    fields: [
      {
        type: 'select',
        name: 'vehicleCategory',
        label: 'Vehicle category',
        options: vehicleCategoryOptions,
        required: true,
      },
      ...vehicleCargoSpeedFields(),
      {
        kind: 'row',
        layout: 'responsive-3',
        fields: [
          {
            type: 'number',
            name: 'crew',
            label: 'Crew',
            min: 0,
            width: 'full',
          },
          {
            type: 'number',
            name: 'passengers',
            label: 'Passengers',
            min: 0,
            width: 'full',
          },
        ],
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'number',
            name: 'ac',
            label: 'AC',
            min: 0,
          },
          {
            type: 'number',
            name: 'hp',
            label: 'HP',
            min: 0,
          },
          {
            type: 'number',
            name: 'damageThreshold',
            label: 'Damage threshold',
            min: 0,
          },
        ],
      },
    ],
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
