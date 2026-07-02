import type { FieldConfig, FormItem, RowConfig } from '../field-config'
import { isContainer } from '../field-config'

function walkItems(items: Array<FormItem | RowConfig>, prefix: string, paths: string[]): void {
  for (const item of items) {
    if (!isContainer(item)) {
      const field = item as FieldConfig
      if (field.type === 'levelRange') {
        const base = prefix ? `${prefix}.${field.name}` : field.name
        paths.push(base)
        if (field.name.endsWith('minLevel') || field.name === 'minLevel') {
          paths.push(base.replace(/minLevel$/, 'maxLevel'))
        } else {
          paths.push(`${base}.maxLevel`)
        }
      } else {
        paths.push(prefix ? `${prefix}.${field.name}` : field.name)
      }
      continue
    }

    if (item.kind === 'row') {
      walkItems(item.fields, prefix, paths)
      continue
    }

    if (item.kind === 'array') {
      walkItems(item.fields, prefix, paths)
      continue
    }

    if (item.kind === 'slot') continue

    walkItems(item.fields, prefix, paths)
  }
}

/** Ordered relative leaf paths for fields inside one array item config. */
export function resolveArrayItemFieldOrder(fields: FormItem[]): string[] {
  const paths: string[] = []
  walkItems(fields, '', paths)
  return paths
}

/** Ordered relative leaf paths scoped to a nested prefix within an array item. */
export function resolveFieldOrderIndex(path: string, fieldOrder: readonly string[]): number {
  const directIndex = fieldOrder.indexOf(path)
  if (directIndex >= 0) return directIndex

  for (let index = fieldOrder.length - 1; index >= 0; index--) {
    const candidate = fieldOrder[index]
    if (path === candidate || path.startsWith(`${candidate}.`)) return index
  }

  return Number.MAX_SAFE_INTEGER
}

export type ArraySectionMeta = {
  fullName: string
  config: import('../field-config').ArrayConfig
  fieldOrder: string[]
}

function walkArraySections(
  items: Array<FormItem | RowConfig>,
  namePrefix: string,
  sections: ArraySectionMeta[],
): void {
  for (const item of items) {
    if (!isContainer(item)) continue

    if (item.kind === 'array') {
      const fullName = namePrefix ? `${namePrefix}.${item.name}` : item.name
      sections.push({
        fullName,
        config: item,
        fieldOrder: resolveArrayItemFieldOrder(item.fields),
      })
      walkArraySections(item.fields, fullName, sections)
      continue
    }

    if (item.kind === 'slot') continue

    walkArraySections(item.fields, namePrefix, sections)
  }
}

/** Collect every array section in a form field tree with relative field order. */
export function collectArraySections(items: FormItem[]): ArraySectionMeta[] {
  const sections: ArraySectionMeta[] = []
  walkArraySections(items, '', sections)
  return sections
}
