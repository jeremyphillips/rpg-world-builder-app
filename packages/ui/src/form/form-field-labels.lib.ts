import type { FieldConfig, FormItem, GroupFieldItem, RowConfig } from './field-config'
import { isNonWhitespaceLabel } from './form-heading.lib'

function isLeafField(item: FormItem | GroupFieldItem | RowConfig): item is FieldConfig {
  return 'type' in item && typeof item.type === 'string'
}

function assertLeafFieldLabels(
  items: readonly (FormItem | GroupFieldItem | RowConfig)[],
  path: string,
) {
  for (const item of items) {
    if (isLeafField(item)) {
      if (!isNonWhitespaceLabel(item.label)) {
        throw new Error(`Form field at ${path}.${item.name} requires a non-whitespace label`)
      }
      continue
    }

    if (item.kind === 'row') {
      assertLeafFieldLabels(item.fields, `${path}.row`)
      continue
    }

    if (item.kind === 'slot') {
      continue
    }

    if (item.kind === 'group' || item.kind === 'array' || item.kind === 'dependent') {
      const nested =
        item.kind === 'dependent'
          ? item.dependents.fields
          : (item as { fields: GroupFieldItem[] }).fields
      assertLeafFieldLabels(nested, `${path}.${item.kind}`)
    }
  }
}

/** Dev/test helper — every leaf field must carry a non-whitespace accessible name. */
export function assertFormFieldLabels(items: readonly FormItem[]): void {
  assertLeafFieldLabels(items, 'fields')
}
