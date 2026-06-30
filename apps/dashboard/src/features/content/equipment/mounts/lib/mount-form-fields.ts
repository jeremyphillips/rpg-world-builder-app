import type { FormItem } from '@rpg/ui/form'

import { mountCapacitySpeedFields } from '../../../lib/content-form-field-helpers'

/** Mount-specific form field group for the unified equipment form. */
export function mountFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Mount',
    fields: mountCapacitySpeedFields(),
  }
}
