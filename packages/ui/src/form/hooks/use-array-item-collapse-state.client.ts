'use client'

import * as React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  buildItemKeysByFieldId,
  collapsedIdsFromSnapshot,
  createArrayItemCollapseSnapshot,
  pruneArrayItemCollapseOverrides,
} from '../config/array/array-item-collapse.lib'
import { readArrayItemCollapseOverrides } from '../config/array/array-item-collapse-storage.lib'
import { useFormUiContext } from '../context/form-ui.context'
import {
  mergeValidationSessionExpandedArrayItems,
  pruneArrayItemCollapseStorageOverrides,
  syncArrayItemCollapseStorageKey,
  toggleArrayItemCollapseField,
} from './array-item-collapse-state.lib'

export interface UseArrayItemCollapseStateOptions {
  fullName: string
  collapsible: boolean
  fields: ReadonlyArray<{ id: string }>
  config: { item?: { collapseKey?: string; defaultCollapsed?: boolean } }
  getItemValues: (index: number) => Record<string, unknown>
}

function serializeActiveItemKeys(itemKeysByFieldId: ReadonlyMap<string, string>): string {
  return [...itemKeysByFieldId.values()].sort().join('\0')
}

export function useArrayItemCollapseState({
  fullName,
  collapsible,
  fields,
  config,
  getItemValues,
}: UseArrayItemCollapseStateOptions) {
  const itemCollapseKey = config.item?.collapseKey ?? 'id'
  const defaultCollapsed = config.item?.defaultCollapsed ?? false
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
  syncArrayItemCollapseStorageKey({
    collapsible,
    fullName,
    readStoredSnapshot: () => {
      const stored = readArrayItemCollapseOverrides(uiStateKey!, fullName)
      return createArrayItemCollapseSnapshot(stored)
    },
    setSnapshot,
    setTrackedStorageSyncKey,
    storageSyncKey,
    trackedStorageSyncKey,
    uiStateKey,
  })

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
    return collapsedIdsFromSnapshot(
      fields,
      itemKeysByFieldId,
      prunedSnapshot,
      itemCount,
      defaultCollapsed,
    )
  }, [collapsible, defaultCollapsed, fields, itemKeysByFieldId, prunedSnapshot, itemCount])

  const collapsedIds = React.useMemo(
    () =>
      mergeValidationSessionExpandedArrayItems({
        collapsible,
        fields,
        fullName,
        itemKeysByFieldId,
        persistedCollapsedIds,
        validationSessionExpandKeys,
      }),
    [
      collapsible,
      fields,
      fullName,
      itemKeysByFieldId,
      persistedCollapsedIds,
      validationSessionExpandKeys,
    ],
  )

  const [trackedActiveItemKeySignature, setTrackedActiveItemKeySignature] = React.useState<
    string | null
  >(null)
  pruneArrayItemCollapseStorageOverrides({
    activeItemKeySignature,
    collapsible,
    fullName,
    itemKeysByFieldId,
    setSnapshot,
    setTrackedActiveItemKeySignature,
    trackedActiveItemKeySignature,
    uiStateKey,
  })

  const toggleCollapse = React.useCallback(
    (fieldId: string) => {
      toggleArrayItemCollapseField({
        collapsible,
        defaultCollapsed,
        fieldId,
        fullName,
        itemCount,
        itemKeysByFieldId,
        removeValidationSessionExpandKeys,
        setSnapshot,
        uiStateKey,
        validationSessionExpandKeys,
      })
    },
    [
      collapsible,
      defaultCollapsed,
      fullName,
      itemCount,
      itemKeysByFieldId,
      uiStateKey,
      validationSessionExpandKeys,
      removeValidationSessionExpandKeys,
    ],
  )

  return { collapsedIds, toggleCollapse }
}
