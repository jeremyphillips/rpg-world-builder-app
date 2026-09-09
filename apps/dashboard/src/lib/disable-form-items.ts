import type {
  ColumnsConfig,
  FieldConfig,
  FormItem,
  GroupFieldItem,
  RowConfig,
  RowFieldItem,
} from '@rpg/ui/form'
import { isRowSlotItem } from '@rpg/ui/form'

function disableFieldConfig<T extends FieldConfig>(field: T, disabled: boolean): T {
  return disabled ? { ...field, disabled: true } : field
}

function disableRowField(field: RowFieldItem, disabled: boolean): RowFieldItem {
  if (isRowSlotItem(field)) return field
  return disableFieldConfig(field, disabled)
}

function disableGroupField(item: GroupFieldItem, disabled: boolean): GroupFieldItem {
  if ('type' in item) return disableFieldConfig(item, disabled)
  if (item.kind === 'row') {
    return {
      ...item,
      fields: item.fields.map((field) => disableRowField(field, disabled)),
    } satisfies RowConfig
  }
  if (item.kind === 'group') {
    return {
      ...item,
      fields: item.fields.map((field) => disableGroupField(field, disabled)),
    }
  }
  if (item.kind === 'columns') {
    return {
      ...item,
      columns: item.columns.map((column) => ({
        fields: column.fields.map((field) => disableFormItem(field, disabled)),
      })) as ColumnsConfig['columns'],
    }
  }
  return item
}

function disableFormItem(item: FormItem, disabled: boolean): FormItem {
  if ('type' in item) return disableFieldConfig(item, disabled)
  if (item.kind === 'row') {
    return {
      ...item,
      fields: item.fields.map((field) => disableRowField(field, disabled)),
    }
  }
  if (item.kind === 'group') {
    return {
      ...item,
      fields: item.fields.map((field) => disableGroupField(field, disabled)),
    }
  }
  if (item.kind === 'columns') {
    return {
      ...item,
      columns: item.columns.map((column) => ({
        fields: column.fields.map((field) => disableFormItem(field, disabled)),
      })) as ColumnsConfig['columns'],
    }
  }
  return item
}

/** Applies `disabled` to every leaf field in a form definition. */
export function disableFormItems(items: FormItem[], disabled: boolean): FormItem[] {
  if (!disabled) return items
  return items.map((item) => disableFormItem(item, true))
}
