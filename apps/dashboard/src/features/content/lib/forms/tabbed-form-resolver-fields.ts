import { isContainer, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

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

  if (item.kind === 'dependent') {
    return {
      ...item,
      controller: {
        ...item.controller,
        name: joinFieldPath(prefix, item.controller.name),
      },
      dependents: {
        ...item.dependents,
        fields: prefixFormItems(item.dependents.fields, prefix),
      },
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

export type EmbeddedMasterDetailTabValidationConfig = {
  /** Root RHF path — used for `errorPaths` and the resolver array `name`. */
  path: string
  /** Tier-1 array legend for validation copy (defaults to `itemLabel`, then `path`). */
  legend?: string
  /** Singular item label; used as legend fallback when `legend` is omitted. */
  itemLabel?: string
  fields: readonly FormItem[]
}

/**
 * Returns paired `errorPaths` + `resolverFields` for embedded master-detail tabs.
 * Spread onto a `TabbedFormTab` alongside `fields: []` and a `header` editor.
 */
export function embeddedMasterDetailTabValidation(
  config: EmbeddedMasterDetailTabValidationConfig,
): Required<Pick<TabbedFormTab, 'errorPaths' | 'resolverFields'>> {
  const { path, fields } = config
  const legend = config.legend ?? config.itemLabel ?? path

  return {
    errorPaths: [path],
    resolverFields: [embeddedArrayResolverField(path, legend, fields)],
  }
}
