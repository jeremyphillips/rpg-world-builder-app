import {
  fixedAcDisplayBounds,
  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORY_ENTRIES,
  type ArmorClassRules,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { vehicleCargoSpeedFields } from '../../../lib/forms/fields/content-speed-form-fields'
import { labelsFromEntries } from '../../lib/equipment-form-field-helpers'

const vehicleCategoryOptions = toOptions(
  VEHICLE_CATEGORIES,
  labelsFromEntries(VEHICLE_CATEGORY_ENTRIES),
)

/** Vehicle-specific form field group for the unified equipment form. */
function openStepperBound(value: number | undefined, fallback: number): number {
  return value ?? fallback
}

export function vehicleFormFieldGroup(rules?: ArmorClassRules): FormItem {
  const bounds = rules ? fixedAcDisplayBounds(rules) : undefined
  return {
    kind: 'group',
    legend: '',
    fields: [
      {
        type: 'select',
        name: 'vehicleCategory',
        label: 'Vehicle category',
        options: vehicleCategoryOptions,
        required: true,
        width: 'xl',
      },
      ...vehicleCargoSpeedFields(),
      {
        kind: 'group',
        legend: 'Combat',
        fields: [
          {
            kind: 'row',
            fields: [
              {
                type: 'number',
                name: 'ac',
                label: 'AC',
                min: rules ? openStepperBound(bounds?.min, Number.MIN_SAFE_INTEGER) : 0,
                ...(rules ? { max: openStepperBound(bounds?.max, Number.MAX_SAFE_INTEGER) } : {}),
                digits: 2,
                width: 'auto',
              },
              {
                type: 'number',
                name: 'hp',
                label: 'HP',
                min: 0,
                digits: 3,
                width: 'auto',
              },
              {
                type: 'number',
                name: 'damageThreshold',
                label: 'Damage threshold',
                min: 0,
                digits: 2,
                width: 'auto',
              },
            ],
          },
        ],
      },
    ],
  }
}
