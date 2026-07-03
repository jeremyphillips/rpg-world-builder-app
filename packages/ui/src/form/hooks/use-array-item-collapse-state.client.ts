'use client'

import * as React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  buildItemKeysByFieldId,
  collapsedIdsFromSnapshot,
  createArrayItemCollapseSnapshot,
  isArrayItemCollapsed,
  pruneArrayItemCollapseOverrides,
  serializeArrayItemCollapseOverrides,
  toggleArrayItemCollapseOverride,
} from '../config/array-item-collapse.lib'
import {
  readArrayItemCollapseOverrides,
  writeArrayItemCollapseOverrides,
} from '../config/array-item-collapse-storage.lib'
import { useFormUiContext, type ValidationSessionExpandKey } from '../context/form-ui.context'

export interface UseArrayItemCollapseStateOptions {
  fullName: string
  collapsible: boolean
  fields: ReadonlyArray<{ id: string }>
  itemCollapseKey?: string
  getItemValues: (index: number) => Record<string, unknown>
}

function serializeActiveItemKeys(itemKeysByFieldId: ReadonlyMap<string, string>): string {
  return [...itemKeysByFieldId.values()].sort().join('\0')
}

function buildValidationSessionExpandKey(
  fullName: string,
  itemKey: string,
): ValidationSessionExpandKey {
  return `${fullName}:${itemKey}`
}

export function useArrayItemCollapseState({
  fullName,
  collapsible,
  fields,
  itemCollapseKey = 'id',
  getItemValues,
}: UseArrayItemCollapseStateOptions) {
  const { uiStateKey, validationSessionExpandKeys, removeValidationSessionExpandKeys } =
    useFormUiContext()
  const { control } = useFormContext()

  const watchedItems = useWatch({
    control,
    name: fullName,
    disabled: !collapsible,
  }) as unknown[] | undefined

  const [snapshot, setSnapshot] = React.useState(() => {
    if (!uiStateKey) return createArrayItemCollapseSnapshot()
    const stored = readArrayItemCollapseOverrides(uiStateKey, fullName)
    return createArrayItemCollapseSnapshot(stored)
  })

  const storageSyncKey = collapsible && uiStateKey ? `${uiStateKey}:${fullName}` : null
  const [trackedStorageSyncKey, setTrackedStorageSyncKey] = React.useState(storageSyncKey)
  if (storageSyncKey !== trackedStorageSyncKey) {
    setTrackedStorageSyncKey(storageSyncKey)
    if (storageSyncKey && uiStateKey) {
      const stored = readArrayItemCollapseOverrides(uiStateKey, fullName)
      setSnapshot(createArrayItemCollapseSnapshot(stored))
    } else {
      setSnapshot(createArrayItemCollapseSnapshot())
    }
  }

  const resolveItemValues = React.useCallback(
    (index: number) =>
      (watchedItems?.[index] ?? getItemValues(index) ?? {}) as Record<string, unknown>,
    [watchedItems, getItemValues],
  )

  const itemKeysByFieldId = React.useMemo(
    () => buildItemKeysByFieldId(fields, resolveItemValues, itemCollapseKey),
    [fields, resolveItemValues, itemCollapseKey],
  )

  const activeItemKeySignature = React.useMemo(
    () => serializeActiveItemKeys(itemKeysByFieldId),
    [itemKeysByFieldId],
  )

  const prunedSnapshot = React.useMemo(() => {
    const activeItemKeys = new Set(itemKeysByFieldId.values())
    return pruneArrayItemCollapseOverrides(snapshot, activeItemKeys)
  }, [snapshot, itemKeysByFieldId])

  const itemCount = fields.length

  const persistedCollapsedIds = React.useMemo(() => {
    if (!collapsible) return new Set<string>()
    return collapsedIdsFromSnapshot(fields, itemKeysByFieldId, prunedSnapshot, itemCount)
  }, [collapsible, fields, itemKeysByFieldId, prunedSnapshot, itemCount])

  const collapsedIds = React.useMemo(() => {
    if (!collapsible || validationSessionExpandKeys.size === 0) return persistedCollapsedIds

    const next = new Set(persistedCollapsedIds)
    for (const field of fields) {
      const itemKey = itemKeysByFieldId.get(field.id)
      if (!itemKey) continue
      if (validationSessionExpandKeys.has(buildValidationSessionExpandKey(fullName, itemKey))) {
        next.delete(field.id)
      }
    }
    return next
  }, [
    collapsible,
    fields,
    fullName,
    itemKeysByFieldId,
    persistedCollapsedIds,
    validationSessionExpandKeys,
  ])

  const [trackedActiveItemKeySignature, setTrackedActiveItemKeySignature] = React.useState<
    string | null
  >(null)
  if (collapsible && uiStateKey && activeItemKeySignature !== trackedActiveItemKeySignature) {
    setTrackedActiveItemKeySignature(activeItemKeySignature)
    const activeItemKeys = new Set(itemKeysByFieldId.values())
    setSnapshot((prev) => {
      const pruned = pruneArrayItemCollapseOverrides(prev, activeItemKeys)
      if (pruned.overrides.size === prev.overrides.size) return prev
      writeArrayItemCollapseOverrides(
        uiStateKey,
        fullName,
        serializeArrayItemCollapseOverrides(pruned),
      )
      return pruned
    })
  }

  const toggleCollapse = React.useCallback(
    (fieldId: string) => {
      if (!collapsible) return
      const itemKey = itemKeysByFieldId.get(fieldId)
      if (itemKey === undefined) return
      const validationSessionKey = buildValidationSessionExpandKey(fullName, itemKey)

      setSnapshot((prev) => {
        const currentlyCollapsed = validationSessionExpandKeys.has(validationSessionKey)
          ? false
          : isArrayItemCollapsed({
              itemCount,
              itemKey,
              overrides: prev.overrides,
            })
        const next = toggleArrayItemCollapseOverride(prev, itemKey, !currentlyCollapsed)
        if (uiStateKey) {
          writeArrayItemCollapseOverrides(
            uiStateKey,
            fullName,
            serializeArrayItemCollapseOverrides(next),
          )
        }
        return next
      })
      removeValidationSessionExpandKeys([validationSessionKey])
    },
    [
      collapsible,
      itemCount,
      itemKeysByFieldId,
      uiStateKey,
      fullName,
      validationSessionExpandKeys,
      removeValidationSessionExpandKeys,
    ],
  )

  return { collapsedIds, toggleCollapse }
}
