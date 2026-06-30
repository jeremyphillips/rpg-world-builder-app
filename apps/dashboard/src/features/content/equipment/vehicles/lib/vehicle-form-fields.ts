import { VEHICLE_CATEGORIES, VEHICLE_CATEGORY_ENTRIES } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { vehicleCargoSpeedFields } from '../../../lib/forms/content-speed-form-fields'
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
        width: 'xl',
      },
      ...vehicleCargoSpeedFields(),
      {
        kind: 'group',
        legend: 'Combat',
        legendSize: 'subsection',
        fields: [
          {
            kind: 'row',
            fields: [
              {
                type: 'number',
                name: 'ac',
                label: 'AC',
                min: 0,
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
