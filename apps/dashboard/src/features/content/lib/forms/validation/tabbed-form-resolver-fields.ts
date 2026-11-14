import {
  isContainer,
  isRowSlotItem,
  prefixFieldConfig,
  type ArrayResolveFieldsFn,
  type ColumnsConfig,
  type FormItem,
  type RowFieldItem,
  type TabbedFormTab,
} from '@rpg/ui/form'

function joinFieldPath(prefix: string, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

function prefixRowFieldItem(field: RowFieldItem, prefix: string): RowFieldItem {
  if (isRowSlotItem(field)) {
    return { ...field, name: joinFieldPath(prefix, field.name) }
  }
  return prefixFieldConfig(field, prefix)
}

/** Prefixes leaf and array/slot names for resolver-only field trees (not rendered). */
export function prefixFormItems(items: readonly FormItem[], prefix: string): FormItem[] {
  return items.map((item) => prefixFormItem(item, prefix))
}

function prefixFormItem(item: FormItem, prefix: string): FormItem {
  if (!isContainer(item)) {
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

export type EmbeddedArrayResolverFieldInput =
  | {
      resolveItemFields: ArrayResolveFieldsFn
      /** Optional static template; omit when rows are fully dynamic. */
      itemFields?: readonly FormItem[]
    }
  | {
      itemFields: readonly FormItem[]
      resolveItemFields?: never
    }

/** Resolver-only array field config for master-detail tabs. */
export function embeddedArrayResolverField(
  name: string,
  sectionLabel: string,
  input: EmbeddedArrayResolverFieldInput,
): FormItem {
  const resolveFields =
    'resolveItemFields' in input && input.resolveItemFields ? input.resolveItemFields : undefined
  const fields = 'itemFields' in input && input.itemFields ? [...input.itemFields] : []

  return {
    kind: 'array',
    name,
    heading: { label: sectionLabel },
    fields,
    ...(resolveFields ? { item: { resolveFields } } : {}),
  }
}

export type EmbeddedMasterDetailTabValidationConfig =
  | {
      path: string
      itemLabel?: string
      resolveItemFields: ArrayResolveFieldsFn
      fields?: readonly FormItem[]
    }
  | {
      path: string
      itemLabel?: string
      fields: readonly FormItem[]
      resolveItemFields?: never
    }

/**
 * Returns paired `errorPaths` + `resolverFields` for embedded master-detail tabs.
 * Spread onto a `TabbedFormTab` alongside `fields: []` and a `header` editor.
 */
export function embeddedMasterDetailTabValidation(
  config: EmbeddedMasterDetailTabValidationConfig,
): Required<Pick<TabbedFormTab, 'errorPaths' | 'resolverFields'>> {
  const { path } = config
  const sectionLabel = config.itemLabel ?? path
  const resolverInput: EmbeddedArrayResolverFieldInput =
    'resolveItemFields' in config && config.resolveItemFields
      ? {
          resolveItemFields: config.resolveItemFields,
          itemFields: config.fields,
        }
      : { itemFields: config.fields }

  return {
    errorPaths: [path],
    resolverFields: [embeddedArrayResolverField(path, sectionLabel, resolverInput)],
  }
}
