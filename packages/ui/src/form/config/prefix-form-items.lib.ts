import {
  isRowSlotItem,
  prefixFieldConfig,
  type ColumnsConfig,
  type FormItem,
  type RowFieldItem,
} from '../field-config'

function joinFieldPath(prefix: string, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

function prefixRowFieldItem(field: RowFieldItem, prefix: string): RowFieldItem {
  if (isRowSlotItem(field)) {
    return { ...field, name: joinFieldPath(prefix, field.name) }
  }
  return prefixFieldConfig(field, prefix)
}

function prefixFormItem(item: FormItem, prefix: string): FormItem {
  if (!('kind' in item)) {
    return prefixFieldConfig(item, prefix)
  }

  if (item.kind === 'array') {
    return {
      ...item,
      name: joinFieldPath(prefix, item.name),
      fields: prefixFormItems(item.fields, ''),
    }
  }

  if (item.kind === 'slot') {
    return {
      ...item,
      name: joinFieldPath(prefix, item.name),
      issuePaths: item.issuePaths?.map((issuePath) => joinFieldPath(prefix, issuePath)),
    }
  }

  if (item.kind === 'row') {
    return {
      ...item,
      fields: item.fields.map((field) => prefixRowFieldItem(field, prefix)),
    }
  }

  if (item.kind === 'dependent') {
    return {
      ...item,
      controller: prefixFieldConfig(item.controller, prefix),
      dependents: {
        ...item.dependents,
        fields: prefixFormItems(item.dependents.fields, prefix),
      },
    }
  }

  if (item.kind === 'columns') {
    return {
      ...item,
      columns: item.columns.map((column) => ({
        fields: prefixFormItems(column.fields, prefix),
      })) as ColumnsConfig['columns'],
    }
  }

  return { ...item, fields: prefixFormItems(item.fields, prefix) }
}

/** Prefixes leaf and array/slot names so resolver paths match absolute RHF paths. */
export function prefixFormItems(items: readonly FormItem[], prefix: string): FormItem[] {
  return items.map((item) => prefixFormItem(item, prefix))
}
