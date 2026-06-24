import { SERVICE_CATEGORIES, SERVICE_CATEGORY_ENTRIES, type ServiceEquipment } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import type { EquipmentFormValues } from '../../lib/equipment-form-def'

const serviceCategoryOptions = toOptions(
  SERVICE_CATEGORIES,
  Object.fromEntries(
    SERVICE_CATEGORIES.map((category) => [category, SERVICE_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof SERVICE_CATEGORIES)[number], string>,
)

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
      {
        type: 'text',
        name: 'duration',
        label: 'Duration',
      },
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
    duration: item.duration,
    notes: item.notes,
  }
}
