import {
  readArrayItemRows,
  resolveArrayRowFieldOrder,
} from '../config/array/array-resolve-fields.lib'
import type { ArrayConfig, FieldConfig, FormItem, RowConfig } from '../field-config'
import { isContainer } from '../field-config'
import { resolveColumnsCollapseSequence } from '../config/form-columns-collapse.lib'
import { inlineSentenceBoundNames } from '../../components/ui/inline-sentence-field.lib'
import { joinedPairBoundNames } from '../../components/ui/joined-pair-field.lib'

type FieldOrderContainer = Extract<FormItem, { kind: string }>

function appendFieldPath(field: FieldConfig, prefix: string, paths: string[]): void {
  if (field.type === 'inlineSentence') {
    for (const name of inlineSentenceBoundNames(field.segments, field.below)) {
      paths.push(prefix ? `${prefix}.${name}` : name)
    }
    return
  }

  if (field.type === 'joinedPair') {
    for (const name of joinedPairBoundNames(field)) {
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

function appendSlotOrderPaths(
  slot: Extract<FormItem, { kind: 'slot' }>,
  prefix: string,
  paths: string[],
): void {
  paths.push(prefix ? `${prefix}.${slot.name}` : slot.name)
  if (!slot.issuePaths?.length) return
  for (const issuePath of slot.issuePaths) {
    paths.push(prefix ? `${prefix}.${issuePath}` : issuePath)
  }
}

function walkContainerItem(item: FieldOrderContainer, prefix: string, paths: string[]): void {
  if (item.kind === 'slot') {
    appendSlotOrderPaths(item, prefix, paths)
    return
  }

  if (item.kind === 'row') {
    for (const field of item.fields) {
      if ('kind' in field && field.kind === 'slot') {
        appendSlotOrderPaths(field, prefix, paths)
        continue
      }
      appendFieldPath(field as FieldConfig, prefix, paths)
    }
    return
  }

  if (item.kind === 'dependent') {
    walkItems([item.controller, ...item.dependents.fields], prefix, paths)
    return
  }

  if (item.kind === 'columns') {
    walkItems(resolveColumnsCollapseSequence(item.columns, item.collapseOrder), prefix, paths)
    return
  }

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
  /** Per-index field order when {@link ArrayItemConfig.resolveFields} is set. */
  resolveItemFieldOrder?: (index: number) => string[]
}

function walkArraySections(
  items: Array<FormItem | RowConfig>,
  namePrefix: string,
  sections: ArraySectionMeta[],
  formValues?: Record<string, unknown>,
): void {
  for (const item of items) {
    if (!isContainer(item)) continue

    if (item.kind === 'array') {
      const fullName = namePrefix ? `${namePrefix}.${item.name}` : item.name
      if (item.item?.resolveFields) {
        const rows = readArrayItemRows(formValues, fullName)
        sections.push({
          fullName,
          config: item,
          fieldOrder: [],
          resolveItemFieldOrder: (index) => resolveArrayRowFieldOrder(item, rows[index], index),
        })
      } else {
        sections.push({
          fullName,
          config: item,
          fieldOrder: resolveArrayItemFieldOrder(item.fields),
        })
        walkArraySections(item.fields, fullName, sections, formValues)
      }
      continue
    }

    if (item.kind === 'slot') continue

    if (item.kind === 'dependent') {
      walkArraySections(
        [item.controller, ...item.dependents.fields],
        namePrefix,
        sections,
        formValues,
      )
      continue
    }

    if (item.kind === 'columns') {
      walkArraySections(
        resolveColumnsCollapseSequence(item.columns, item.collapseOrder),
        namePrefix,
        sections,
        formValues,
      )
      continue
    }

    walkArraySections(item.fields, namePrefix, sections, formValues)
  }
}

function resolveSectionFieldOrder(
  section: ArraySectionMeta | undefined,
  itemIndex: number | undefined,
): readonly string[] {
  if (!section) return []
  if (itemIndex !== undefined && section.resolveItemFieldOrder) {
    return section.resolveItemFieldOrder(itemIndex)
  }
  return section.fieldOrder
}

/** Collect every array section in a form field tree with relative field order. */
export function collectArraySections(
  items: FormItem[],
  formValues?: Record<string, unknown>,
): ArraySectionMeta[] {
  const sections: ArraySectionMeta[] = []
  walkArraySections(items, '', sections, formValues)
  return sections
}

export { resolveSectionFieldOrder }
