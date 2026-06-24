import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_ENTRIES,
  SERVICE_DURATION_UNITS,
  SERVICE_DURATION_UNIT_ENTRIES,
  type ServiceDuration,
  type ServiceDurationUnit,
  type ServiceEquipment,
} from '@rpg/contracts'
import { toOptions, type FieldConfig, type FormItem } from '@rpg/ui/form'

import type { EquipmentFormValues } from '../../lib/equipment-form-def'

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

export function durationFromForm(
  duration: { value?: number; unit?: ServiceDurationUnit } | undefined,
): ServiceDuration | undefined {
  const value = duration?.value
  const unit = duration?.unit
  if (value === undefined || Number.isNaN(value) || !unit) return undefined
  return { value, unit }
}

export function durationToForm(
  duration: ServiceDuration | undefined,
): EquipmentFormValues['duration'] {
  return duration ? { value: duration.value, unit: duration.unit } : undefined
}

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
        type: 'select',
        name: 'serviceCategory',
        label: 'Service category',
        options: serviceCategoryOptions,
        required: true,
      },
      serviceDurationField(),
      {
        type: 'textarea',
        name: 'notes',
        label: 'Notes',
      },
    ],
  }
}

export function serviceFormValuesFromEntity(
  item: ServiceEquipment,
): Pick<EquipmentFormValues, 'serviceCategory' | 'duration' | 'notes'> {
  return {
    serviceCategory: item.serviceCategory,
    duration: durationToForm(item.duration),
    notes: item.notes,
  }
}
