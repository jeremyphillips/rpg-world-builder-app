import { readArrayItemRows, resolveArrayRowFields } from './array/array-resolve-fields.lib'
import type { FormItem } from '../field-config'
import { resolveColumnsCollapseSequence } from './form-columns-collapse.lib'
import { arrayItemLabel } from './array/array-item-label.lib'
import { resolveArrayItemHeader } from './array/array-item-config.lib'
import {
  resolveArrayHeading,
  resolveArraySectionLabelForDisplay,
} from './array/resolve-array-heading.lib'
import type { RegistryEntry } from './field-error-map-register.lib'
import { registerFieldPaths } from './field-error-map-register.lib'
import { fieldCategory } from './field-error-map-category.lib'
import type { FieldConfig } from '../field-config'

function registerField(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  field: FieldConfig,
): void {
  registerFieldPaths(registry, prefix, field, fieldCategory(field))
}

function registerArrayItem(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  item: Extract<FormItem, { kind: 'array' }>,
  registerItems: (
    registry: Map<string, RegistryEntry>,
    prefix: string,
    items: FormItem[],
    formValues?: Record<string, unknown>,
  ) => void,
  formValues?: Record<string, unknown>,
): void {
  const arrayKey = prefix ? `${prefix}.${item.name}` : item.name
  const arrayLabel = resolveArrayHeading(item)?.label ?? resolveArraySectionLabelForDisplay(item)
  const header = resolveArrayItemHeader(item, arrayLabel)
  registry.set(arrayKey, {
    label: arrayLabel,
    category: 'array',
    role: 'array',
    itemLabel: arrayItemLabel(header, arrayLabel),
    exactPath: true,
  })

  if (item.item?.resolveFields) {
    const rows = readArrayItemRows(formValues, arrayKey)
    if (rows.length === 0) {
      registerItems(
        registry,
        `${arrayKey}.0`,
        resolveArrayRowFields(item, undefined, 0),
        formValues,
      )
      return
    }
    rows.forEach((row, index) => {
      registerItems(
        registry,
        `${arrayKey}.${index}`,
        resolveArrayRowFields(item, row, index),
        formValues,
      )
    })
    return
  }

  registerItems(registry, `${arrayKey}.*`, item.fields, formValues)
}

function registerSlotIssuePathAliases(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  item: Extract<FormItem, { kind: 'slot' }>,
): void {
  if (!item.issuePaths?.length) return

  const aliasLabel = item.heading?.label ?? item.name
  for (const issuePath of item.issuePaths) {
    const ownedKey = prefix ? `${prefix}.${issuePath}` : issuePath
    if (registry.has(ownedKey)) continue
    registry.set(ownedKey, {
      label: aliasLabel,
      category: 'text',
      role: 'slotOwner',
      exactPath: true,
      labelOnly: true,
    })
  }
}

function registerSlotItem(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  item: Extract<FormItem, { kind: 'slot' }>,
): void {
  const slotKey = prefix ? `${prefix}.${item.name}` : item.name
  registry.set(slotKey, {
    label: item.heading?.label ?? item.name,
    category: 'text',
    role: item.issuePaths?.length ? 'slotOwner' : 'hostSlot',
    exactPath: true,
  })
  registerSlotIssuePathAliases(registry, prefix, item)
}

function registerDependentItem(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  item: Extract<FormItem, { kind: 'dependent' }>,
  registerItems: (
    registry: Map<string, RegistryEntry>,
    prefix: string,
    items: FormItem[],
    formValues?: Record<string, unknown>,
  ) => void,
  formValues?: Record<string, unknown>,
): void {
  registerItems(registry, prefix, [item.controller], formValues)
  registerItems(registry, prefix, item.dependents.fields as FormItem[], formValues)
}

function registerContainerItem(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  item: Extract<FormItem, { kind: 'group' | 'row' | 'columns' }>,
  registerItems: (
    registry: Map<string, RegistryEntry>,
    prefix: string,
    items: FormItem[],
    formValues?: Record<string, unknown>,
  ) => void,
  formValues?: Record<string, unknown>,
): void {
  if (item.kind === 'columns') {
    registerItems(
      registry,
      prefix,
      resolveColumnsCollapseSequence(item.columns, item.collapseOrder),
      formValues,
    )
    return
  }

  registerItems(registry, prefix, item.fields as FormItem[], formValues)
}

export function registerFormItems(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  items: FormItem[],
  formValues?: Record<string, unknown>,
): void {
  for (const item of items) {
    if (!('kind' in item)) {
      registerField(registry, prefix, item)
      continue
    }

    switch (item.kind) {
      case 'array':
        registerArrayItem(registry, prefix, item, registerFormItems, formValues)
        break
      case 'slot':
        registerSlotItem(registry, prefix, item)
        break
      case 'dependent':
        registerDependentItem(registry, prefix, item, registerFormItems, formValues)
        break
      case 'group':
      case 'row':
      case 'columns':
        registerContainerItem(registry, prefix, item, registerFormItems, formValues)
        break
    }
  }
}
