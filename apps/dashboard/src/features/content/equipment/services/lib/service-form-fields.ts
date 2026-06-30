import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_ENTRIES,
  SERVICE_DURATION_UNITS,
  SERVICE_DURATION_UNIT_ENTRIES,
  type ServiceDurationUnit,
} from '@rpg/contracts'
import { toOptions, type FieldConfig, type FormItem } from '@rpg/ui/form'

const serviceCategoryOptions = toOptions(
  SERVICE_CATEGORIES,
  Object.fromEntries(
    SERVICE_CATEGORIES.map((category) => [category, SERVICE_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof SERVICE_CATEGORIES)[number], string>,
)

const serviceDurationUnitOptions = toOptions(
  SERVICE_DURATION_UNITS,
  Object.fromEntries(
    SERVICE_DURATION_UNITS.map((unit) => [unit, SERVICE_DURATION_UNIT_ENTRIES[unit].label]),
  ) as Record<ServiceDurationUnit, string>,
)

function serviceDurationField(): FieldConfig {
  return {
    type: 'inputSelect',
    name: 'duration',
    label: 'Duration',
    inputType: 'number',
    valueKey: 'value',
    unitKey: 'unit',
    options: serviceDurationUnitOptions,
    min: 1,
    valueDigits: 1,
    width: 'auto',
    unitPlaceholder: 'Select…',
    hint: 'Leave blank for no duration',
    defaultValue: { unit: 'day' },
  }
}

/** Service-specific form field group for the unified equipment form. */
export function serviceFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Service',
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'serviceCategory',
            label: 'Service category',
            options: serviceCategoryOptions,
            required: true,
            width: 'full',
          },
          serviceDurationField(),
        ],
      },
      {
        type: 'textarea',
        name: 'notes',
        label: 'Notes',
      },
    ],
  }
}
