import { VEHICLE_CATEGORIES, VEHICLE_CATEGORY_ENTRIES, type VehicleEquipment } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import {
  massInputSelectField,
  massToForm,
  VEHICLE_CARGO_CAPACITY_LABEL,
} from '../../../lib/content-form-field-helpers'
import type { EquipmentFormValues } from '../../lib/equipment-form-def'

function labelsFromEntries<const T extends string>(
  entries: Record<T, { label: string }>,
): Record<T, string> {
  return Object.fromEntries(
    (Object.entries(entries) as [T, { label: string }][]).map(([key, value]) => [key, value.label]),
  ) as Record<T, string>
}

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
      {
        type: 'text',
        name: 'speed',
        label: 'Speed',
      },
      massInputSelectField({
        name: 'cargoCapacity',
        label: VEHICLE_CARGO_CAPACITY_LABEL,
        defaultUnit: 'ton',
        valueDigits: 3,
      }),
      {
        kind: 'row',
        fields: [
          {
            type: 'number',
            name: 'crew',
            label: 'Crew',
            min: 0,
          },
          {
            type: 'number',
            name: 'passengers',
            label: 'Passengers',
            min: 0,
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
