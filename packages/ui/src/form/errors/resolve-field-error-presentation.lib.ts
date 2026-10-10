import { resolveDependsOnWatchName } from '../config/form-depends-on.lib'
import type { FormIssue } from './form-issue.types'
import type { FieldConfig, FieldVisibility, FormItem, RowConfig } from '../field-config'
import {
  isFieldVisible,
  resolveDependentsVisibility,
  resolveFieldConfigBoundNames,
  type DependentConfig,
} from '../field-config'
import type { FormValidationPresentation } from '../context/form-ui.context'

export type PresentationSessionFlags = {
  validationPresentation: FormValidationPresentation
  hasAttemptedSubmit: boolean
  hasAttemptedPublish: boolean
  publishPresentationEnabled: boolean
}

export function isPresentationSessionExpanded(presentation: PresentationSessionFlags): boolean {
  if (presentation.validationPresentation === 'always') return true
  if (presentation.hasAttemptedSubmit) return true
  if (presentation.publishPresentationEnabled && presentation.hasAttemptedPublish) return true
  return false
}

/** Segment-bound prefix match — `features.1` does not match `features.10`. */
export function isInactivePathPrefix(inactivePath: string, fieldPath: string): boolean {
  if (inactivePath === fieldPath) return true
  return fieldPath.startsWith(`${inactivePath}.`)
}

export function isFieldPathEligibleForPresentation(
  fieldPath: string | undefined,
  inactivePaths: ReadonlySet<string>,
): boolean {
  if (!fieldPath) return true
  for (const inactive of inactivePaths) {
    if (isInactivePathPrefix(inactive, fieldPath)) return false
  }
  return true
}

function getValueAtPath(values: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.')
  let current: unknown = values
  for (const segment of segments) {
    if (current === null || typeof current !== 'object') return undefined
    if (Array.isArray(current)) {
      const index = Number(segment)
      if (!Number.isInteger(index)) return undefined
      current = current[index]
      continue
    }
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

function resolveVisibilityWatchValues(
  visibility: FieldVisibility,
  formValues: Record<string, unknown>,
  namePrefix?: string,
): Record<string, unknown> {
  const watched: Record<string, unknown> = {}
  for (const dep of visibility.dependsOn) {
    const path = resolveDependsOnWatchName(dep, namePrefix)
    watched[dep] = getValueAtPath(formValues, path)
  }
  return watched
}

function isContainerVisible(
  visibility: FieldVisibility | undefined,
  formValues: Record<string, unknown>,
  namePrefix?: string,
): boolean {
  if (!visibility) return true
  return visibility.visibleWhen(resolveVisibilityWatchValues(visibility, formValues, namePrefix))
}

function addInactiveBoundNames(field: FieldConfig, inactive: Set<string>): void {
  for (const name of resolveFieldConfigBoundNames(field)) {
    inactive.add(name)
  }
}

function walkInactiveField(
  field: FieldConfig,
  formValues: Record<string, unknown>,
  inactive: Set<string>,
  namePrefix?: string,
  forceInactive = false,
): void {
  const visibilityValues = field.visibility
    ? resolveVisibilityWatchValues(field.visibility, formValues, namePrefix)
    : formValues
  const hidden = forceInactive || !isFieldVisible(field, visibilityValues)
  if (hidden) addInactiveBoundNames(field, inactive)
}

function walkInactiveContainerFields(
  fields: Array<FormItem | RowConfig>,
  visibility: FieldVisibility | undefined,
  formValues: Record<string, unknown>,
  inactive: Set<string>,
  namePrefix?: string,
  forceInactive = false,
): void {
  const hidden = forceInactive || !isContainerVisible(visibility, formValues, namePrefix)
  walkInactiveFromItems(fields, formValues, inactive, namePrefix, hidden)
}

function walkInactiveFormItem(
  item: FormItem,
  formValues: Record<string, unknown>,
  inactive: Set<string>,
  namePrefix?: string,
  forceInactive = false,
): void {
  switch (item.kind) {
    case 'array':
    case 'slot':
      return
    case 'row':
      walkInactiveContainerFields(
        item.fields,
        item.visibility,
        formValues,
        inactive,
        namePrefix,
        forceInactive,
      )
      return
    case 'columns':
      for (const column of item.columns) {
        walkInactiveContainerFields(
          column.fields,
          column.visibility,
          formValues,
          inactive,
          namePrefix,
          forceInactive,
        )
      }
      return
    case 'group':
      walkInactiveContainerFields(
        item.fields,
        item.visibility,
        formValues,
        inactive,
        namePrefix,
        forceInactive,
      )
      return
    case 'dependent':
      walkDependentInactive(item, formValues, inactive, namePrefix, forceInactive)
  }
}

function walkInactiveFromItems(
  items: Array<FormItem | RowConfig>,
  formValues: Record<string, unknown>,
  inactive: Set<string>,
  namePrefix?: string,
  forceInactive = false,
): void {
  for (const item of items) {
    if (!('kind' in item)) {
      walkInactiveField(item, formValues, inactive, namePrefix, forceInactive)
      continue
    }
    walkInactiveFormItem(item, formValues, inactive, namePrefix, forceInactive)
  }
}

function resolveVisibilityWatchValuesForField(
  field: FieldConfig,
  formValues: Record<string, unknown>,
  namePrefix?: string,
): Record<string, unknown> {
  if (!field.visibility) return formValues
  return resolveVisibilityWatchValues(field.visibility, formValues, namePrefix)
}

function walkDependentInactive(
  item: DependentConfig,
  formValues: Record<string, unknown>,
  inactive: Set<string>,
  namePrefix?: string,
  forceInactive = false,
): void {
  const sectionHidden =
    forceInactive || !isContainerVisible(item.visibility, formValues, namePrefix)
  if (sectionHidden) {
    addInactiveBoundNames(item.controller, inactive)
    walkInactiveFromItems(
      item.dependents.fields as Array<FormItem | RowConfig>,
      formValues,
      inactive,
      namePrefix,
      true,
    )
    return
  }

  const controllerHidden = !isFieldVisible(
    item.controller,
    resolveVisibilityWatchValuesForField(item.controller, formValues, namePrefix),
  )
  if (controllerHidden) {
    addInactiveBoundNames(item.controller, inactive)
  }

  const dependentsVisibility = resolveDependentsVisibility(item, item.controller)
  const dependentsHidden = dependentsVisibility
    ? !dependentsVisibility.visibleWhen(
        resolveVisibilityWatchValues(dependentsVisibility, formValues, namePrefix),
      )
    : false

  walkInactiveFromItems(
    item.dependents.fields as Array<FormItem | RowConfig>,
    formValues,
    inactive,
    namePrefix,
    dependentsHidden,
  )
}

/** Bound paths whose config gate is currently false (visibility / dependent nest). */
export function collectInactiveFieldPaths(
  items: FormItem[],
  formValues: Record<string, unknown>,
): ReadonlySet<string> {
  const inactive = new Set<string>()
  walkInactiveFromItems(items, formValues, inactive)
  return inactive
}

export function isPathTouched(fieldPath: string, touchedPaths: readonly string[]): boolean {
  return touchedPaths.some(
    (path) =>
      path === fieldPath ||
      isInactivePathPrefix(fieldPath, path) ||
      isInactivePathPrefix(path, fieldPath),
  )
}

export function shouldShowFieldErrorPresentation(
  fieldPath: string | undefined,
  session: PresentationSessionFlags,
  inactivePaths: ReadonlySet<string>,
  touchedPaths: readonly string[],
): boolean {
  if (!fieldPath) return false
  if (!isFieldPathEligibleForPresentation(fieldPath, inactivePaths)) return false
  if (isPresentationSessionExpanded(session)) return true
  return isPathTouched(fieldPath, touchedPaths)
}

export function issueMatchesFieldPath(
  issue: Pick<FormIssue, 'path' | 'presentationPath'>,
  fieldPath: string,
): boolean {
  const presentationPath = issue.presentationPath ?? issue.path
  return presentationPath === fieldPath || issue.path === fieldPath
}

export function filterIssuesForPresentation(
  issues: readonly FormIssue[],
  inactivePaths: ReadonlySet<string>,
): FormIssue[] {
  return issues.filter((issue) => {
    const presentationPath = issue.presentationPath ?? issue.path
    return (
      isFieldPathEligibleForPresentation(issue.path, inactivePaths) &&
      isFieldPathEligibleForPresentation(presentationPath, inactivePaths)
    )
  })
}
