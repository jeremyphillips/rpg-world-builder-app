import type { Subclass } from '@rpg/contracts'

import type { SubclassFormValues } from './subclass-form-fields'
import { getMergedSubclassFormValues, type SubclassDraft } from './subclass-editor-state'
import {
  isSubclassFormValuesLike,
  serializeSubclassFormValues,
} from './subclass-form-value-snapshot'

export function applySubclassFormEdits(
  current: Record<string, Partial<SubclassFormValues>>,
  selectedId: string,
  values: SubclassFormValues,
  subclasses: Subclass[],
  drafts: SubclassDraft[],
): Record<string, Partial<SubclassFormValues>> {
  if (!isSubclassFormValuesLike(values)) return current

  const base = getMergedSubclassFormValues(selectedId, subclasses, drafts, {})
  const serializedValues = serializeSubclassFormValues(values)

  if (serializedValues === serializeSubclassFormValues(base)) {
    if (!(selectedId in current)) return current
    const copy = { ...current }
    delete copy[selectedId]
    return copy
  }

  const stored = current[selectedId]
  if (
    stored &&
    isSubclassFormValuesLike(stored) &&
    serializedValues === serializeSubclassFormValues(stored)
  ) {
    return current
  }

  return { ...current, [selectedId]: values }
}
