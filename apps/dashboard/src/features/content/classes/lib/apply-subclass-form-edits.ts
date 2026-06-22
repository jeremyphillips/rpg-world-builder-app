import type { Subclass } from '@rpg/contracts'

import type { SubclassFormValues } from './subclass-form-def'
import { getMergedSubclassFormValues, type SubclassDraft } from './subclass-editor-state'

export function applySubclassFormEdits(
  current: Record<string, Partial<SubclassFormValues>>,
  selectedId: string,
  values: SubclassFormValues,
  subclasses: Subclass[],
  drafts: SubclassDraft[],
): Record<string, Partial<SubclassFormValues>> {
  const base = getMergedSubclassFormValues(selectedId, subclasses, drafts, {})
  const serializedValues = JSON.stringify(values)

  if (serializedValues === JSON.stringify(base)) {
    if (!(selectedId in current)) return current
    const copy = { ...current }
    delete copy[selectedId]
    return copy
  }

  if (serializedValues === JSON.stringify(current[selectedId])) {
    return current
  }

  return { ...current, [selectedId]: values }
}
