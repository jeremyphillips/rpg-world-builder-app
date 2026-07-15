'use client'

/**
 * React hook that wires array "Add" interactions to `useFieldArray`.
 *
 * Exposes `appendItem` for the plain button path, `appendFromAddMenu` for
 * `ArrayConfig.addActionMenu` template selections (merge defaults, expand, focus),
 * and live `addActionMenuItems` with duplicate-policy presentation applied.
 */
import * as React from 'react'
import type { UseFieldArrayAppend, UseFieldArrayReturn } from 'react-hook-form'

import { buildArrayAddMenuItems } from '../../config/array-add-menu.lib'
import type { ValidationSessionExpandKey } from '../../errors'
import type { ArrayConfig } from '../../field-config'
import {
  buildArrayAddMenuExpandKeys,
  buildStaticArrayItemDefaults,
  mergeArrayAddMenuDefaults,
  resolveArrayAppendDefaults,
  scheduleArrayItemFocus,
} from './array-field-append.lib'

type UseArrayFieldAppendOptions = {
  config: ArrayConfig
  fullName: string
  fields: UseFieldArrayReturn['fields']
  append: UseFieldArrayAppend<Record<string, unknown>>
  getValues: (name: string) => unknown
  watchedItems: unknown[] | undefined
  collapsible: boolean
  itemCollapseKey: string | undefined
  addValidationSessionExpandKeys: (keys: readonly ValidationSessionExpandKey[]) => void
}

export function useArrayFieldAppend({
  config,
  fullName,
  fields,
  append,
  getValues,
  watchedItems,
  collapsible,
  itemCollapseKey,
  addValidationSessionExpandKeys,
}: UseArrayFieldAppendOptions) {
  const staticItemDefaults = React.useMemo(
    () => buildStaticArrayItemDefaults(config.fields),
    [config.fields],
  )

  const appendItem = React.useCallback(
    (defaults?: Record<string, unknown>) => {
      const nextDefaults =
        defaults ??
        resolveArrayAppendDefaults(
          config,
          staticItemDefaults,
          (getValues(fullName) as unknown[]) ?? [],
        )
      append(nextDefaults)
    },
    [append, config, fullName, getValues, staticItemDefaults],
  )

  const appendWithDefaults = React.useCallback(
    (defaults: Record<string, unknown>) => {
      const newIndex = fields.length
      append(defaults)

      if (collapsible) {
        addValidationSessionExpandKeys(
          buildArrayAddMenuExpandKeys(fullName, newIndex, defaults, itemCollapseKey),
        )
      }

      scheduleArrayItemFocus(fullName, newIndex)
    },
    [addValidationSessionExpandKeys, append, collapsible, fields.length, fullName, itemCollapseKey],
  )

  const appendFromAddMenu = React.useCallback(
    (itemId: string) => {
      const menuItem = config.addActionMenu?.items.find((item) => item.id === itemId)
      if (!menuItem) return

      const mergedDefaults = mergeArrayAddMenuDefaults(menuItem, staticItemDefaults)
      appendWithDefaults(mergedDefaults)
    },
    [appendWithDefaults, config.addActionMenu?.items, staticItemDefaults],
  )

  const addActionMenuItems = React.useMemo(() => {
    if (!config.addActionMenu) return []
    return buildArrayAddMenuItems(config.addActionMenu, watchedItems ?? [])
  }, [config.addActionMenu, watchedItems])

  return { appendItem, appendFromAddMenu, appendWithDefaults, addActionMenuItems }
}
