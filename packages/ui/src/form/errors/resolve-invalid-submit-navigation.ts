import { classifyFormIssues } from './classify-form-issue'
import { flattenFormIssues } from './flatten-form-issues'
import { sortFormIssues } from './group-form-issues'
import { collectArraySections } from './resolve-field-order'
import { resolveIssueFocusControlId } from './resolve-issue-focus-target'
import type { FormIssue } from './form-issue.types'
import type { ArrayConfig, FormItem } from '../field-config'

export type ValidationSessionExpandKey = `${string}:${string}`

/** Session expand key for one array row — `${fullName}:${collapseKey}`. */
export function buildValidationSessionExpandKey(
  fullName: string,
  itemIndex: number,
  itemValues?: Record<string, unknown>,
  collapseKeyField = 'id',
): ValidationSessionExpandKey {
  const stable = itemValues?.[collapseKeyField]
  const collapseKey =
    typeof stable === 'string' && stable.length > 0 ? stable : `index:${itemIndex}`
  return `${fullName}:${collapseKey}`
}

function findArrayConfigForPath(path: string, sections: ReturnType<typeof collectArraySections>) {
  return sections.find(
    (section) => path === section.fullName || path.startsWith(`${section.fullName}.`),
  )
}

/** Expand keys for every array ancestor containing an issue path. */
export function resolveValidationExpandKeys(
  issue: FormIssue,
  sections: ReturnType<typeof collectArraySections>,
  getItemValues: (fullName: string, index: number) => Record<string, unknown> | undefined,
): ValidationSessionExpandKey[] {
  const keys: ValidationSessionExpandKey[] = []
  const segments = issue.path.split('.')

  for (let index = 0; index < segments.length - 1; index++) {
    const next = segments[index + 1]
    if (next === undefined || !/^\d+$/.test(next)) continue

    const fullName = segments.slice(0, index + 1).join('.')
    const itemIndex = Number(next)
    const section = findArrayConfigForPath(fullName, sections)
    const itemValues = getItemValues(fullName, itemIndex)

    keys.push(
      buildValidationSessionExpandKey(
        fullName,
        itemIndex,
        itemValues,
        section?.config.itemCollapseKey ?? 'id',
      ),
    )
  }

  return keys
}

export type InvalidSubmitNavigation = {
  firstIssue: FormIssue
  expandKeys: ValidationSessionExpandKey[]
  focusControlId?: string
}

export type ResolveInvalidSubmitNavigationOptions = {
  errors: Parameters<typeof flattenFormIssues>[0]
  fields: FormItem[]
  idPrefix: string
  getItemValues?: (fullName: string, index: number) => Record<string, unknown> | undefined
}

/** Resolve first invalid issue, expand keys, and focus target after a failed submit. */
export function resolveInvalidSubmitNavigation(
  options: ResolveInvalidSubmitNavigationOptions,
): InvalidSubmitNavigation | undefined {
  const sections = collectArraySections(options.fields)
  const flatIssues = flattenFormIssues(options.errors)
  if (flatIssues.length === 0) return undefined

  const classified = flatIssues.map((issue) => {
    const section = sections
      .filter(
        (entry) =>
          issue.path.startsWith(`${entry.fullName}.`) || issue.arrayPath === entry.fullName,
      )
      .sort((left, right) => right.fullName.length - left.fullName.length)[0]

    return classifyFormIssues([issue], {
      arrayPattern: section?.config.arrayPattern,
      fieldOrder: section?.fieldOrder,
    })[0]!
  })

  const sorted = sortFormIssues(classified, sections)
  const firstIssue = sorted[0]
  if (!firstIssue) return undefined

  const getItemValues = options.getItemValues ?? (() => undefined)
  const expandKeys = resolveValidationExpandKeys(firstIssue, sections, getItemValues)

  const focusSection = sections
    .filter(
      (entry) =>
        firstIssue.path.startsWith(`${entry.fullName}.`) || firstIssue.arrayPath === entry.fullName,
    )
    .sort((left, right) => right.fullName.length - left.fullName.length)[0]

  const focusControlId = resolveIssueFocusControlId(
    firstIssue,
    options.idPrefix,
    focusSection?.config.arrayPattern,
  )

  return { firstIssue, expandKeys, focusControlId }
}

export function prepareFormIssues(
  errors: Parameters<typeof flattenFormIssues>[0],
  fields: FormItem[],
): FormIssue[] {
  const sections = collectArraySections(fields)
  const flatIssues = flattenFormIssues(errors)

  return flatIssues.map((issue) => {
    const section = sections
      .filter(
        (entry) =>
          issue.path.startsWith(`${entry.fullName}.`) || issue.arrayPath === entry.fullName,
      )
      .sort((left, right) => right.fullName.length - left.fullName.length)[0]

    return classifyFormIssues([issue], {
      arrayPattern: section?.config.arrayPattern,
      fieldOrder: section?.fieldOrder,
    })[0]!
  })
}

export function findArrayConfigAtPath(
  fields: FormItem[],
  fullName: string,
): ArrayConfig | undefined {
  return collectArraySections(fields).find((section) => section.fullName === fullName)?.config
}
