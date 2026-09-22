import type { Dispatch, SetStateAction } from 'react'

import {
  createArrayItemCollapseSnapshot,
  isArrayItemCollapsed,
  pruneArrayItemCollapseOverrides,
  serializeArrayItemCollapseOverrides,
  toggleArrayItemCollapseOverride,
  type ArrayItemCollapseSnapshot,
} from '../config/array/array-item-collapse.lib'
import { writeArrayItemCollapseOverrides } from '../config/array/array-item-collapse-storage.lib'
import type { ValidationSessionExpandKey } from '../context/form-ui.context'

export function buildValidationSessionExpandKey(
  fullName: string,
  itemKey: string,
): ValidationSessionExpandKey {
  return `${fullName}:${itemKey}`
}

export function mergeValidationSessionExpandedArrayItems(options: {
  collapsible: boolean
  fields: ReadonlyArray<{ id: string }>
  fullName: string
  itemKeysByFieldId: ReadonlyMap<string, string>
  persistedCollapsedIds: ReadonlySet<string>
  validationSessionExpandKeys: ReadonlySet<ValidationSessionExpandKey>
}): ReadonlySet<string> {
  const {
    collapsible,
    fields,
    fullName,
    itemKeysByFieldId,
    persistedCollapsedIds,
    validationSessionExpandKeys,
  } = options

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
}

export function toggleArrayItemCollapseField(options: {
  collapsible: boolean
  defaultCollapsed: boolean
  fieldId: string
  fullName: string
  itemCount: number
  itemKeysByFieldId: ReadonlyMap<string, string>
  removeValidationSessionExpandKeys: (keys: readonly ValidationSessionExpandKey[]) => void
  setSnapshot: Dispatch<SetStateAction<ArrayItemCollapseSnapshot>>
  uiStateKey: string | undefined
  validationSessionExpandKeys: ReadonlySet<ValidationSessionExpandKey>
}): void {
  const {
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
  } = options

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
          defaultCollapsed,
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
}

export function syncArrayItemCollapseStorageKey(options: {
  collapsible: boolean
  fullName: string
  readStoredSnapshot: () => ArrayItemCollapseSnapshot
  setSnapshot: Dispatch<SetStateAction<ArrayItemCollapseSnapshot>>
  setTrackedStorageSyncKey: Dispatch<SetStateAction<string | null>>
  storageSyncKey: string | null
  trackedStorageSyncKey: string | null
  uiStateKey: string | undefined
}): void {
  const {
    storageSyncKey,
    trackedStorageSyncKey,
    setTrackedStorageSyncKey,
    uiStateKey,
    readStoredSnapshot,
    setSnapshot,
  } = options

  if (storageSyncKey === trackedStorageSyncKey) return

  setTrackedStorageSyncKey(storageSyncKey)
  if (storageSyncKey && uiStateKey) {
    setSnapshot(readStoredSnapshot())
    return
  }
  setSnapshot(createArrayItemCollapseSnapshot())
}

export function pruneArrayItemCollapseStorageOverrides(options: {
  activeItemKeySignature: string
  collapsible: boolean
  fullName: string
  itemKeysByFieldId: ReadonlyMap<string, string>
  setSnapshot: Dispatch<SetStateAction<ArrayItemCollapseSnapshot>>
  setTrackedActiveItemKeySignature: Dispatch<SetStateAction<string | null>>
  trackedActiveItemKeySignature: string | null
  uiStateKey: string | undefined
}): void {
  const {
    activeItemKeySignature,
    collapsible,
    fullName,
    itemKeysByFieldId,
    setSnapshot,
    setTrackedActiveItemKeySignature,
    trackedActiveItemKeySignature,
    uiStateKey,
  } = options

  if (!collapsible || !uiStateKey || activeItemKeySignature === trackedActiveItemKeySignature) {
    return
  }

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
