import type { FormItem } from '@rpg/ui/form'

import { mountCapacitySpeedFields } from '../../../lib/forms/fields/content-speed-form-fields'

/** Mount-specific form field group for the unified equipment form. */
export function mountFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Mount',
    fields: mountCapacitySpeedFields(),
  }
}
