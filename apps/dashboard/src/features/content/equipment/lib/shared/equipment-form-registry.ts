import type { FormItem } from '@rpg/ui/form'

import { serviceFormFieldGroup } from '../../services/lib/service-form-fields'

export { visibleWhenKind } from './visible-when-kind'

/** Per-family form field groups registered as they are extracted from the monolith. */
export function buildRegisteredKindFieldGroups(): FormItem[] {
  return [serviceFormFieldGroup()]
}
