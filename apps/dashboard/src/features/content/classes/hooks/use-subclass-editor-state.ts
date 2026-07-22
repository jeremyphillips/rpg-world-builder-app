import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ResolvedSubclass, Subclass } from '@rpg/contracts'

import { applySubclassFormEdits } from '../lib/subclasses/apply-subclass-form-edits'
import {
  buildSubclassListItems,
  createSubclassDraft,
  getMergedSubclassFormValues,
  isSubclassModified,
  selectNextSubclassId,
  type SubclassDraft,
  type SubclassListItem,
} from '../lib/subclasses/subclass-editor-state'
import type { SubclassFormValues } from '../lib/subclasses/subclass-form-fields'
import { isDraftSubclassId } from '../lib/subclasses/subclass-editor-constants'

function collectModifiedSubclassIds(
  listItems: SubclassListItem[],
  subclasses: Subclass[],
  drafts: SubclassDraft[],
  edits: Record<string, Partial<SubclassFormValues>>,
): Set<string> {
  const ids = new Set<string>()
  for (const item of listItems) {
    if (isSubclassModified(item.id, subclasses, drafts, edits)) {
      ids.add(item.id)
    }
  }
  return ids
}

function syncSubclassSelection(
  listItems: SubclassListItem[],
  selectedId: string | null,
  setSelectedId: (id: string | null) => void,
): void {
  if (listItems.length === 0) return

  const selectedMissing = selectedId !== null && !listItems.some((item) => item.id === selectedId)

  if (selectedId === null || selectedMissing) {
    setSelectedId(listItems[0]?.id ?? null)
  }
}

function initialActiveById(subclasses: ResolvedSubclass[]): Record<string, boolean> {
  return Object.fromEntries(subclasses.map((subclass) => [subclass.id, subclass.activeInCampaign]))
}

export function useSubclassEditorState(
  classId: string | undefined,
  subclasses: ResolvedSubclass[],
) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<SubclassDraft[]>([])
  const [edits, setEdits] = useState<Record<string, Partial<SubclassFormValues>>>({})
  const [activeById, setActiveById] = useState<Record<string, boolean>>(() =>
    initialActiveById(subclasses),
  )
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [savePending, setSavePending] = useState(false)

  useEffect(() => {
    setActiveById((current) => {
      let changed = false
      const next = { ...current }
      for (const subclass of subclasses) {
        if (next[subclass.id] === undefined) {
          next[subclass.id] = subclass.activeInCampaign
          changed = true
        }
      }
      return changed ? next : current
    })
  }, [subclasses])

  const listItems = useMemo(
    () => buildSubclassListItems(subclasses, drafts, edits),
    [subclasses, drafts, edits],
  )

  const modifiedIds = useMemo(
    () => collectModifiedSubclassIds(listItems, subclasses, drafts, edits),
    [listItems, subclasses, drafts, edits],
  )

  useEffect(() => {
    syncSubclassSelection(listItems, selectedId, setSelectedId)
  }, [listItems, selectedId])

  const handleAdd = useCallback(() => {
    if (!classId) return
    const draft = createSubclassDraft(classId)
    setDrafts((current) => [...current, draft])
    setSelectedId(draft.id)
  }, [classId])

  const handleValuesChange = useCallback(
    (values: SubclassFormValues) => {
      if (!selectedId) return
      setEdits((current) => applySubclassFormEdits(current, selectedId, values, subclasses, drafts))
    },
    [selectedId, subclasses, drafts],
  )

  const handleActiveChange = useCallback((id: string, active: boolean) => {
    setActiveById((current) => ({ ...current, [id]: active }))
  }, [])

  const clearEditsFor = useCallback((id: string) => {
    setEdits((current) => {
      if (!(id in current)) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }, [])

  const removeDraft = useCallback((draftId: string) => {
    setDrafts((current) => current.filter((draft) => draft.id !== draftId))
  }, [])

  const commitDraftHandoff = useCallback(
    (draftId: string, saved: Subclass) => {
      setDrafts((current) => current.filter((draft) => draft.id !== draftId))
      clearEditsFor(draftId)
      setSelectedId(saved.id)
    },
    [clearEditsFor],
  )

  const removeLocalRow = useCallback(
    (id: string) => {
      if (isDraftSubclassId(id)) {
        removeDraft(id)
      }
      clearEditsFor(id)
      setActiveById((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      setSelectedId((current) => selectNextSubclassId(listItems, id, current))
    },
    [clearEditsFor, listItems, removeDraft],
  )

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteTargetId(id)
  }, [])

  const handleDeleteDismiss = useCallback(() => {
    setDeleteTargetId(null)
  }, [])

  const handleDeleteConfirmLocal = useCallback(() => {
    if (!deleteTargetId) return
    removeLocalRow(deleteTargetId)
    setDeleteTargetId(null)
  }, [deleteTargetId, removeLocalRow])

  const deleteTargetItem = deleteTargetId
    ? listItems.find((item) => item.id === deleteTargetId)
    : undefined

  const selectedEntity = selectedId
    ? subclasses.find((subclass) => subclass.id === selectedId)
    : undefined

  const selectedValues =
    selectedId !== null ? getMergedSubclassFormValues(selectedId, subclasses, drafts, edits) : null

  const hasUnsavedEdits = drafts.length > 0 || modifiedIds.size > 0

  return {
    listItems,
    modifiedIds,
    selectedId,
    setSelectedId,
    activeById,
    deleteTargetId,
    deleteTargetItem,
    selectedEntity,
    selectedValues,
    savePending,
    setSavePending,
    hasUnsavedEdits,
    handleAdd,
    handleValuesChange,
    handleActiveChange,
    handleDeleteRequest,
    handleDeleteDismiss,
    handleDeleteConfirmLocal,
    clearEditsFor,
    commitDraftHandoff,
    removeLocalRow,
  }
}

export type SubclassEditorState = ReturnType<typeof useSubclassEditorState>
