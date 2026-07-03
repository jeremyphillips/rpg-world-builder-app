/**
 * Pure helpers for array append behavior in `ArrayFieldRenderer`.
 *
 * Resolves default values for plain and add-menu appends, builds validation
 * session expand keys for newly added collapsible rows, and schedules
 * best-effort scroll/focus into the new item.
 */
import type { ArrayConfig } from '../field-config'
import { buildItemDefaultValues } from '../field-config'
import {
  resolveArrayAddMenuAppendDefaults,
  type ArrayAddMenuItemConfig,
} from '../config/array-add-menu.lib'
import { buildValidationSessionExpandKey, type ValidationSessionExpandKey } from '../errors'
import {
  focusFirstEligibleArrayItemControl,
  scrollArrayItemElementIntoView,
} from './array-field-item-focus.lib'

export function resolveArrayAppendDefaults(
  config: ArrayConfig,
  staticItemDefaults: Record<string, unknown>,
  currentItems: unknown[],
): Record<string, unknown> {
  return config.appendDefaults ? config.appendDefaults(currentItems) : staticItemDefaults
}

export function mergeArrayAddMenuDefaults(
  menuItem: ArrayAddMenuItemConfig,
  staticItemDefaults: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...staticItemDefaults,
    ...resolveArrayAddMenuAppendDefaults(menuItem.appendDefaults),
  }
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
