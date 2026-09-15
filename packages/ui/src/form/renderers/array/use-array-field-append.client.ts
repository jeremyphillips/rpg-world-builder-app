'use client'

/**
 * React hook that wires array "Add" interactions to `useFieldArray`.
 *
 * Exposes `appendItem` for the plain button path, `appendItemWithDefaults` for
 * explicit payloads / add-menu merges, and live `addActionMenuItems` with
 * duplicate-policy presentation applied.
 */
import * as React from 'react'
import type { UseFieldArrayAppend, UseFieldArrayReturn } from 'react-hook-form'

import { buildArrayAddMenuItems } from '../../config/array/array-add-menu.lib'
import { resolveArrayAddAction } from '../../config/array/array-item-config.lib'
import type { ValidationSessionExpandKey } from '../../errors'
import type { ArrayConfig } from '../../field-config'
import {
  assertAppendPayload,
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

  const appendItem = React.useCallback(() => {
    append(
      resolveArrayAppendDefaults(
        config,
        staticItemDefaults,
        (getValues(fullName) as unknown[]) ?? [],
      ),
    )
  }, [append, config, fullName, getValues, staticItemDefaults])

  const appendItemWithDefaults = React.useCallback(
    (defaults: Record<string, unknown>) => {
      const payload = assertAppendPayload(defaults)
      const newIndex = fields.length
      append(payload)

      if (collapsible) {
        addValidationSessionExpandKeys(
          buildArrayAddMenuExpandKeys(fullName, newIndex, payload, itemCollapseKey),
        )
      }

      scheduleArrayItemFocus(fullName, newIndex)
    },
    [addValidationSessionExpandKeys, append, collapsible, fields.length, fullName, itemCollapseKey],
  )

  const appendFromAddMenu = React.useCallback(
    (itemId: string) => {
      const menuItem = resolveArrayAddAction(config)?.menu?.items.find((item) => item.id === itemId)
      if (!menuItem) return

      appendItemWithDefaults(mergeArrayAddMenuDefaults(menuItem, staticItemDefaults, config.fields))
    },
    [appendItemWithDefaults, config, staticItemDefaults],
  )

  const addActionMenu = resolveArrayAddAction(config)?.menu

  const addActionMenuItems = React.useMemo(() => {
    if (!addActionMenu) return []
    return buildArrayAddMenuItems(addActionMenu, watchedItems ?? [])
  }, [addActionMenu, watchedItems])

  return { appendItem, appendItemWithDefaults, appendFromAddMenu, addActionMenuItems }
}
