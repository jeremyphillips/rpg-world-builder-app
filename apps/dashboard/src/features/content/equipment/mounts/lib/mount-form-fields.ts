import {
  formatMass,
  formatSpeedRate,
  MOUNT_CARRYING_CAPACITY_LABEL,
  type MountEquipment,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { ContentStatRowData } from '../../../lib/detail/metadata/content-stat-rows'
import { mountCapacitySpeedFields } from '../../../lib/forms/fields/content-speed-form-fields'

/** Mount-specific form field group for the unified equipment form. */
export function mountFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: '',
    chrome: { variant: 'outline' },
    fields: mountCapacitySpeedFields(),
  }
}

/** Stat rows for mount equipment detail (excludes kind and cost). */
export function getMountStatRows(item: MountEquipment): ContentStatRowData[] {
  return [
    { label: MOUNT_CARRYING_CAPACITY_LABEL, value: formatMass(item.carryingCapacity) },
    { label: 'Speed', value: formatSpeedRate(item.speed) },
  ]
}
