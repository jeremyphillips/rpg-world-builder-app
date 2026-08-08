import { hasDirtyFields } from './form-dirty-state'

/** Canonical OR for leave-guard dirty signals — body fields plus additive extras. */
export function composeFormLeaveDirty({
  dirtyFields,
  extraUnsavedEdits,
  campaignAccessDirty,
  subclassEdits,
}: {
  dirtyFields: Record<string, unknown>
  extraUnsavedEdits?: boolean
  campaignAccessDirty?: boolean
  subclassEdits?: boolean
}): boolean {
  return (
    hasDirtyFields(dirtyFields) ||
    Boolean(subclassEdits) ||
    Boolean(extraUnsavedEdits) ||
    Boolean(campaignAccessDirty)
  )
}
