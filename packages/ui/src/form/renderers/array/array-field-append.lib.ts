/**
 * Pure helpers for array append behavior in `ArrayFieldRenderer`.
 *
 * Resolves default values for plain and add-menu appends, builds validation
 * session expand keys for newly added collapsible rows, and schedules
 * best-effort scroll/focus into the new item.
 */
import type { ArrayConfig, FormItem } from '../../field-config'
import {
  buildItemDefaultValues,
  isFieldVisible,
  resolveFieldConfigBoundNames,
} from '../../field-config'
import { resolveColumnsCollapseSequence } from '../../config/form-columns-collapse.lib'
import {
  resolveArrayAddMenuAppendDefaults,
  type ArrayAddMenuItemConfig,
} from '../../config/array/array-add-menu.lib'
import { buildValidationSessionExpandKey, type ValidationSessionExpandKey } from '../../errors'
import {
  focusFirstEligibleArrayItemControl,
  scrollArrayItemElementIntoView,
} from './array-field-item-focus.lib'

function isContainerVisible(
  item: Extract<FormItem, { kind: 'group' | 'row' | 'columns' | 'dependent' }>,
  values: Record<string, unknown>,
): boolean {
  if (item.kind === 'dependent' && !isFieldVisible(item.controller, values)) {
    return false
  }
  return item.visibility ? item.visibility.visibleWhen(values) : true
}

function containerChildItems(
  item: Extract<FormItem, { kind: 'group' | 'row' | 'columns' }>,
): FormItem[] {
  if (item.kind === 'columns') {
    return resolveColumnsCollapseSequence(item.columns, item.collapseOrder)
  }
  return item.fields as FormItem[]
}

function collectAllBoundNames(items: readonly FormItem[]): string[] {
  const names: string[] = []

  for (const item of items) {
    if (!('kind' in item)) {
      names.push(...resolveFieldConfigBoundNames(item))
      continue
    }

    switch (item.kind) {
      case 'group':
      case 'row':
      case 'columns':
        names.push(...collectAllBoundNames(containerChildItems(item)))
        break
      case 'dependent':
        names.push(...resolveFieldConfigBoundNames(item.controller))
        names.push(...collectAllBoundNames(item.dependents.fields as FormItem[]))
        break
      default:
        break
    }
  }

  return names
}

function collectHiddenBoundNames(
  items: readonly FormItem[],
  values: Record<string, unknown>,
): string[] {
  const hidden: string[] = []

  for (const item of items) {
    if (!('kind' in item)) {
      if (!isFieldVisible(item, values)) {
        hidden.push(...resolveFieldConfigBoundNames(item))
      }
      continue
    }

    switch (item.kind) {
      case 'group':
      case 'row':
      case 'columns': {
        const children = containerChildItems(item)
        if (!isContainerVisible(item, values)) {
          hidden.push(...collectAllBoundNames(children))
          break
        }
        hidden.push(...collectHiddenBoundNames(children, values))
        break
      }
      case 'dependent': {
        if (!isContainerVisible(item, values)) {
          hidden.push(...resolveFieldConfigBoundNames(item.controller))
          hidden.push(...collectAllBoundNames(item.dependents.fields as FormItem[]))
          break
        }
        if (!isFieldVisible(item.controller, values)) {
          hidden.push(...resolveFieldConfigBoundNames(item.controller))
        }
        hidden.push(...collectHiddenBoundNames(item.dependents.fields as FormItem[], values))
        break
      }
      default:
        break
    }
  }

  return hidden
}

export type BuildVisibleItemDefaultsOptions = {
  /** Discriminator keys that must survive pruning even when their controls are hidden. */
  preserveKeys?: readonly string[]
}

/**
 * Drops values for fields hidden under the supplied row state. Honors group and
 * leaf `visibility` — not just flattened leaf names.
 */
export function buildVisibleItemDefaults(
  fields: readonly FormItem[],
  values: Record<string, unknown>,
  options: BuildVisibleItemDefaultsOptions = {},
): Record<string, unknown> {
  const preserve = new Set(options.preserveKeys ?? [])
  const hidden = new Set(collectHiddenBoundNames(fields, values))
  const nextValues = { ...values }

  for (const key of hidden) {
    if (preserve.has(key)) continue
    delete nextValues[key]
  }

  return nextValues
}

export function assertAppendPayload(defaults: unknown): Record<string, unknown> {
  if (
    defaults === null ||
    typeof defaults !== 'object' ||
    Array.isArray(defaults) ||
    defaults instanceof Event ||
    (typeof HTMLElement !== 'undefined' && defaults instanceof HTMLElement)
  ) {
    throw new Error('appendItemWithDefaults expects a plain object payload.')
  }

  return defaults as Record<string, unknown>
}

export function resolveArrayAppendDefaults(
  config: ArrayConfig,
  staticItemDefaults: Record<string, unknown>,
  currentItems: unknown[],
): Record<string, unknown> {
  const merged = config.appendDefaults ? config.appendDefaults(currentItems) : staticItemDefaults
  return buildVisibleItemDefaults(config.fields, merged, {
    preserveKeys: Object.keys(merged),
  })
}

export function mergeArrayAddMenuDefaults(
  menuItem: ArrayAddMenuItemConfig,
  staticItemDefaults: Record<string, unknown>,
  itemFields: readonly FormItem[],
): Record<string, unknown> {
  const templateDefaults = resolveArrayAddMenuAppendDefaults(menuItem.appendDefaults)
  const merged = {
    ...staticItemDefaults,
    ...templateDefaults,
  }

  return buildVisibleItemDefaults(itemFields, merged, {
    preserveKeys: Object.keys(templateDefaults),
  })
}

export function buildArrayAddMenuExpandKeys(
  fullName: string,
  newIndex: number,
  mergedDefaults: Record<string, unknown>,
  itemCollapseKey: string | undefined,
): readonly ValidationSessionExpandKey[] {
  return [
    buildValidationSessionExpandKey(fullName, newIndex, mergedDefaults, itemCollapseKey ?? 'id'),
  ]
}

export function scheduleArrayItemFocus(fullName: string, index: number): void {
  const itemPrefix = `${fullName}.${index}`
  window.requestAnimationFrame(() => {
    const rowElement = document.querySelector(`[data-array-item-prefix="${itemPrefix}"]`)
    if (!rowElement) return
    scrollArrayItemElementIntoView(rowElement)
    focusFirstEligibleArrayItemControl(rowElement)
  })
}

export function buildStaticArrayItemDefaults(
  fields: ArrayConfig['fields'],
): Record<string, unknown> {
  return buildItemDefaultValues(fields)
}
