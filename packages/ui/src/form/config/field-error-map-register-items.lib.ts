import type { FormItem } from '../field-config'
import { arrayItemLabel } from './array/array-item-label.lib'
import { resolveArrayItemHeader } from './array/array-item-config.lib'
import { resolveArrayHeading } from '../resolve-container-heading.lib'
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
  registerItems: (registry: Map<string, RegistryEntry>, prefix: string, items: FormItem[]) => void,
): void {
  const arrayKey = prefix ? `${prefix}.${item.name}` : item.name
  const arrayLabel = resolveArrayHeading(item)?.label ?? item.legend ?? item.name
  const header = resolveArrayItemHeader(item, arrayLabel)
  registry.set(arrayKey, {
    label: arrayLabel,
    category: 'array',
    itemLabel: arrayItemLabel(header, arrayLabel),
  })
  registerItems(registry, `${arrayKey}.*`, item.fields)
}

function registerSlotItem(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  item: Extract<FormItem, { kind: 'slot' }>,
): void {
  const slotKey = prefix ? `${prefix}.${item.name}` : item.name
  registry.set(slotKey, {
    label: item.label ?? item.name,
    category: 'text',
  })
}

function registerDependentItem(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  item: Extract<FormItem, { kind: 'dependent' }>,
  registerItems: (registry: Map<string, RegistryEntry>, prefix: string, items: FormItem[]) => void,
): void {
  registerItems(registry, prefix, [item.controller])
  registerItems(registry, prefix, item.dependents.fields as FormItem[])
}

function registerContainerItem(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  item: Extract<FormItem, { kind: 'group' | 'row' }>,
  registerItems: (registry: Map<string, RegistryEntry>, prefix: string, items: FormItem[]) => void,
): void {
  registerItems(registry, prefix, item.fields as FormItem[])
}

export function registerFormItems(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  items: FormItem[],
): void {
  for (const item of items) {
    if (!('kind' in item)) {
      registerField(registry, prefix, item)
      continue
    }

    switch (item.kind) {
      case 'array':
        registerArrayItem(registry, prefix, item, registerFormItems)
        break
      case 'slot':
        registerSlotItem(registry, prefix, item)
        break
      case 'dependent':
        registerDependentItem(registry, prefix, item, registerFormItems)
        break
      case 'group':
      case 'row':
        registerContainerItem(registry, prefix, item, registerFormItems)
        break
    }
  }
}
