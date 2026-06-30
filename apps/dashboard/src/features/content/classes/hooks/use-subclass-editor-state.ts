import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Subclass } from '@rpg/contracts'

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

export function useSubclassEditorState(classId: string | undefined, subclasses: Subclass[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<SubclassDraft[]>([])
  const [edits, setEdits] = useState<Record<string, Partial<SubclassFormValues>>>({})
  const [activeById, setActiveById] = useState<Record<string, boolean>>({})
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

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

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteTargetId(id)
  }, [])

  const handleDeleteDismiss = useCallback(() => {
    setDeleteTargetId(null)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTargetId) return

    setDrafts((current) => current.filter((draft) => draft.id !== deleteTargetId))
    setEdits((current) => {
      const next = { ...current }
      delete next[deleteTargetId]
      return next
    })
    setActiveById((current) => {
      const next = { ...current }
      delete next[deleteTargetId]
      return next
    })
    setSelectedId((current) => selectNextSubclassId(listItems, deleteTargetId, current))
    setDeleteTargetId(null)
  }, [deleteTargetId, listItems])

  const deleteTargetItem = deleteTargetId
    ? listItems.find((item) => item.id === deleteTargetId)
    : undefined

  const selectedEntity = selectedId
    ? subclasses.find((subclass) => subclass.id === selectedId)
    : undefined

  const selectedValues =
    selectedId !== null ? getMergedSubclassFormValues(selectedId, subclasses, drafts, edits) : null

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
    handleAdd,
    handleValuesChange,
    handleActiveChange,
    handleDeleteRequest,
    handleDeleteDismiss,
    handleDeleteConfirm,
  }
}
