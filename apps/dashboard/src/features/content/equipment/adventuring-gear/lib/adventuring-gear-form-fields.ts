import { GEAR_KINDS, GEAR_KIND_ENTRIES, type AdventuringGearEquipment } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import type { EquipmentFormValues } from '../../lib/equipment-form-def'

function labelsFromEntries<const T extends string>(
  entries: Record<T, { label: string }>,
): Record<T, string> {
  return Object.fromEntries(
    (Object.entries(entries) as [T, { label: string }][]).map(([key, value]) => [key, value.label]),
  ) as Record<T, string>
}

const gearKindOptions = toOptions(GEAR_KINDS, labelsFromEntries(GEAR_KIND_ENTRIES))

/** Joins mechanical property lines for the unified equipment form textarea. */
export function formatPropertiesText(items: string[] | undefined): string | undefined {
  return items?.length ? items.join('\n') : undefined
}

/** Adventuring gear-specific form field group for the unified equipment form. */
export function adventuringGearFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Adventuring Gear',
    fields: [
      {
        type: 'select',
        name: 'gearKind',
        label: 'Gear kind',
        options: gearKindOptions,
        required: true,
      },
      {
        kind: 'row',
        fields: [
          {
            type: 'number',
            name: 'bundleSize',
            label: 'Bundle size',
            min: 1,
          },
          {
            type: 'text',
            name: 'storage',
            label: 'Storage',
          },
        ],
      },
      {
        type: 'textarea',
        name: 'propertiesText',
        label: 'Properties',
        hint: 'One mechanical note per line',
      },
      {
        type: 'text',
        name: 'capacity',
        label: 'Capacity',
      },
    ],
  }
}

export function adventuringGearFormValuesFromEntity(
  item: AdventuringGearEquipment,
): Pick<
  EquipmentFormValues,
  'gearKind' | 'bundleSize' | 'storage' | 'propertiesText' | 'capacity'
> {
  return {
    gearKind: item.gearKind,
    bundleSize: item.bundleSize,
    storage: item.storage,
    propertiesText: formatPropertiesText(item.properties),
    capacity: item.capacity,
  }
}
