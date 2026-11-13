import { flattenFields, isFieldVisible, type FormItem } from '../../field-config'

/** Whether any item body field would render for the current row values. */
export function arrayItemHasVisibleBodyFields(
  items: FormItem[],
  values: Record<string, unknown>,
): boolean {
  return flattenFields(items).some((field) => isFieldVisible(field, values))
}
