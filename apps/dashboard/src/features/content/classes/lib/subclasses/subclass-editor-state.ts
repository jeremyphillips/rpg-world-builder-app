import type { ContentSource, Subclass } from '@rpg/contracts'

import type { SubclassFormValues } from './subclass-form-fields'
import { subclassFormDef } from './subclass-form-values'
import {
  createDraftSubclassId,
  isDraftSubclassId,
  UNTITLED_SUBCLASS_LABEL,
} from './subclass-editor-constants'

export type SubclassDraft = {
  id: string
  classId: string
  source: 'homebrew'
}

export type SubclassListItem = {
  id: string
  name: string
  source: ContentSource | 'unsaved'
  classId: string
}

export function createSubclassDraft(classId: string): SubclassDraft {
  return {
    id: createDraftSubclassId(),
    classId,
    source: 'homebrew',
  }
}

export function draftToListItem(
  draft: SubclassDraft,
  edits: Partial<SubclassFormValues>,
): SubclassListItem {
  return {
    id: draft.id,
    name: edits.name?.trim() || UNTITLED_SUBCLASS_LABEL,
    source: 'unsaved',
    classId: draft.classId,
  }
}

export function subclassToListItem(
  subclass: Subclass,
  edits: Partial<SubclassFormValues>,
): SubclassListItem {
  return {
    id: subclass.id,
    name: edits.name?.trim() || subclass.name,
    source: subclass.source,
    classId: subclass.classId,
  }
}

export function buildSubclassListItems(
  subclasses: Subclass[],
  drafts: SubclassDraft[],
  edits: Record<string, Partial<SubclassFormValues>>,
): SubclassListItem[] {
  const seedItems = subclasses.map((subclass) =>
    subclassToListItem(subclass, edits[subclass.id] ?? {}),
  )
  const draftItems = drafts.map((draft) => draftToListItem(draft, edits[draft.id] ?? {}))
  return [...seedItems, ...draftItems]
}

export function resolveSubclassEntity(
  id: string,
  subclasses: Subclass[],
  drafts: SubclassDraft[],
): Subclass | SubclassDraft | undefined {
  if (isDraftSubclassId(id)) {
    return drafts.find((draft) => draft.id === id)
  }
  return subclasses.find((subclass) => subclass.id === id)
}

export function getMergedSubclassFormValues(
  id: string,
  subclasses: Subclass[],
  drafts: SubclassDraft[],
  edits: Record<string, Partial<SubclassFormValues>>,
): SubclassFormValues {
  const entity = resolveSubclassEntity(id, subclasses, drafts)
  if (entity && 'name' in entity && !isDraftSubclassId(id)) {
    const base = subclassFormDef.toFormValues(entity as Subclass)
    return { ...base, ...(edits[id] ?? {}) }
  }

  return { name: '', tagline: '', description: '', features: [], ...(edits[id] ?? {}) }
}

export function isSubclassModified(
  id: string,
  subclasses: Subclass[],
  drafts: SubclassDraft[],
  edits: Record<string, Partial<SubclassFormValues>>,
): boolean {
  const patch = edits[id]
  if (!patch || Object.keys(patch).length === 0) return false

  const merged = getMergedSubclassFormValues(id, subclasses, drafts, {})
  const current = getMergedSubclassFormValues(id, subclasses, drafts, edits)
  return JSON.stringify(merged) !== JSON.stringify(current)
}

export function selectNextSubclassId(
  items: SubclassListItem[],
  deletedId: string,
  currentSelectedId: string | null,
): string | null {
  if (currentSelectedId !== deletedId) return currentSelectedId
  const remaining = items.filter((item) => item.id !== deletedId)
  return remaining[0]?.id ?? null
}
