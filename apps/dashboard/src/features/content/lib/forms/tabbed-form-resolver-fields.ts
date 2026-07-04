import { isContainer, type FormItem } from '@rpg/ui/form'

function joinFieldPath(prefix: string, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

/** Prefixes leaf and array/slot names for resolver-only field trees (not rendered). */
export function prefixFormItems(items: readonly FormItem[], prefix: string): FormItem[] {
  return items.map((item) => prefixFormItem(item, prefix))
}

function prefixFormItem(item: FormItem, prefix: string): FormItem {
  if (!isContainer(item)) {
    return { ...item, name: joinFieldPath(prefix, item.name) }
  }

  if (item.kind === 'array') {
    return {
      ...item,
      name: joinFieldPath(prefix, item.name),
      fields: prefixFormItems(item.fields, ''),
    }
  }

  if (item.kind === 'slot') {
    return { ...item, name: joinFieldPath(prefix, item.name) }
  }

  if (item.kind === 'row') {
    return {
      ...item,
      fields: item.fields.map((field) => ({
        ...field,
        name: joinFieldPath(prefix, field.name),
      })),
    }
  }

  return { ...item, fields: prefixFormItems(item.fields, prefix) }
}

/** Resolver-only array field config for master-detail tabs. */
export function embeddedArrayResolverField(
  name: string,
  legend: string,
  itemFields: readonly FormItem[],
): FormItem {
  return {
    kind: 'array',
    name,
    legend,
    fields: [...itemFields],
  }
}
