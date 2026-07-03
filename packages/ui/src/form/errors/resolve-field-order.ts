import type { ArrayConfig, FieldConfig, FormItem, RowConfig } from '../field-config'
import { isContainer } from '../field-config'
import { inlineSentenceBoundNames } from '../../components/ui/inline-sentence-field.lib'

type FieldOrderContainer = Extract<FormItem, { kind: string }>

function appendFieldPath(field: FieldConfig, prefix: string, paths: string[]): void {
  if (field.type === 'inlineSentence') {
    for (const name of inlineSentenceBoundNames(field.segments, field.below)) {
      paths.push(prefix ? `${prefix}.${name}` : name)
    }
    return
  }

  const base = prefix ? `${prefix}.${field.name}` : field.name

  if (field.type !== 'levelRange') {
    paths.push(base)
    return
  }

  paths.push(base)
  paths.push(
    field.name.endsWith('minLevel') || field.name === 'minLevel'
      ? base.replace(/minLevel$/, 'maxLevel')
      : `${base}.maxLevel`,
  )
}

function walkContainerItem(item: FieldOrderContainer, prefix: string, paths: string[]): void {
  if (item.kind === 'slot') return

  const nestedPrefix = item.kind === 'array' ? prefix : prefix
  walkItems(item.fields, nestedPrefix, paths)
}

function walkItems(items: Array<FormItem | RowConfig>, prefix: string, paths: string[]): void {
  for (const item of items) {
    if (!isContainer(item)) {
      appendFieldPath(item as FieldConfig, prefix, paths)
      continue
    }

    walkContainerItem(item, prefix, paths)
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
  config: ArrayConfig
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
