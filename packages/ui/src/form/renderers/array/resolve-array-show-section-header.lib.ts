import type { FieldHintConfig } from '../../field-config'
import type { ArrayAddActionLayout, ArrayConfig } from '../../field-config'
import type { ArrayLabelMode } from '../../config/array/resolve-array-label.lib'
import { resolveArrayRequiredMarker } from './array-field-empty-state.lib'

/** Whether the array fieldset renders a visible header cluster (and anatomy stack gap). */
export function resolveArrayShowSectionHeader(options: {
  labelMode: ArrayLabelMode
  sectionHint?: string | FieldHintConfig
  addActionLayout: ArrayAddActionLayout
  hasAddAction: boolean
  arrayIssueCount: number
  hasContainerIssue: boolean
  config: ArrayConfig
}): boolean {
  return (
    options.labelMode === 'visible' ||
    Boolean(options.sectionHint) ||
    (options.addActionLayout === 'inline' && options.hasAddAction) ||
    options.arrayIssueCount > 0 ||
    options.hasContainerIssue ||
    resolveArrayRequiredMarker(options.config)
  )
}
