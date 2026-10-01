import { expect } from 'vitest'
import type { ZodError, ZodType } from 'zod'

import {
  buildDefaultValues,
  flattenFields,
  flattenSelectFieldOptions,
  prefixFieldConfig,
  resolveFieldConfigPrimaryName,
  type ChipsFieldConfig,
  type FieldConfig,
  type FormItem,
  type RowConfig,
  type SelectFieldConfig,
} from '@rpg/ui/form'

import { setNestedFormValue } from './set-nested-form-value.lib'

const NUMERIC_OPTION_VALUE = /^\d+$/

export type AssertNumericSelectStringValuesParseOptions = {
  /** Full form values when create defaults fail unrelated rules. */
  knownValidValues?: Record<string, unknown>
}

type NumericSelectTarget = {
  path: string
  optionValue: string
}

function normalizeZodPath(path: readonly (string | number)[]): string {
  return path.map((segment) => (typeof segment === 'number' ? '*' : segment)).join('.')
}

function issuePaths(result: { success: true } | { success: false; error: ZodError }): Set<string> {
  if (result.success) return new Set()
  return new Set(
    result.error.issues.map((issue) => normalizeZodPath(issue.path as (string | number)[])),
  )
}

function pathMatchesFieldPath(issuePath: string, fieldPath: string): boolean {
  if (issuePath === fieldPath) return true
  const fieldSegments = fieldPath.split('.')
  const issueSegments = issuePath.split('.')
  if (issueSegments.length !== fieldSegments.length) return false
  return fieldSegments.every((segment, index) => {
    const other = issueSegments[index]!
    return segment === '*' || other === '*' || segment === other
  })
}

function issuesAtFieldPath(paths: Set<string>, fieldPath: string): Set<string> {
  const normalizedFieldPath = fieldPath.replace(/\.\d+\./g, '.*.')
  return new Set(
    [...paths].filter((path) => {
      const normalizedIssuePath = path.replace(/\.\d+\./g, '.*.')
      return (
        pathMatchesFieldPath(path, fieldPath) ||
        pathMatchesFieldPath(normalizedIssuePath, normalizedFieldPath)
      )
    }),
  )
}

function resolveNumericSelectField(
  field: FieldConfig,
): SelectFieldConfig | ChipsFieldConfig | undefined {
  if (field.type === 'select') return field
  if (field.type === 'chips' && !field.multiple) return field
  return undefined
}

function isNumericSelectField(field: FieldConfig): boolean {
  const selectField = resolveNumericSelectField(field)
  if (!selectField?.options || selectField.options.length === 0) return false
  const options = flattenSelectFieldOptions(selectField.options)
  if (options.length === 0) return false
  return options.every(
    (option) => typeof option.value === 'string' && NUMERIC_OPTION_VALUE.test(option.value),
  )
}

function firstNumericOptionValue(field: SelectFieldConfig | ChipsFieldConfig): string | undefined {
  const options = flattenSelectFieldOptions(field.options ?? [])
  const first = options[0]
  return first ? String(first.value) : undefined
}

function joinPath(prefix: string, segment: string): string {
  return prefix ? `${prefix}.${segment}` : segment
}

function pushNumericSelectTarget(
  field: FieldConfig,
  pathPrefix: string,
  targets: NumericSelectTarget[],
): void {
  const selectField = resolveNumericSelectField(field)
  if (!selectField || !isNumericSelectField(field)) return
  const resolved = (pathPrefix ? prefixFieldConfig(selectField, pathPrefix) : selectField) as
    | SelectFieldConfig
    | ChipsFieldConfig
  const path = resolveFieldConfigPrimaryName(resolved)
  const optionValue = firstNumericOptionValue(resolved)
  if (!optionValue) return
  targets.push({ path, optionValue })
}

function collectFromContainer(
  item: Extract<FormItem, { kind: string }>,
  pathPrefix: string,
  targets: NumericSelectTarget[],
): void {
  if (item.kind === 'array') {
    const arrayPath = joinPath(pathPrefix, item.name)
    collectNumericSelectTargets(item.fields, `${arrayPath}.0`, targets)
    return
  }
  if (item.kind === 'dependent') {
    collectNumericSelectTargets([item.controller], pathPrefix, targets)
    collectNumericSelectTargets(item.dependents.fields, pathPrefix, targets)
    return
  }
  if (item.kind === 'columns') {
    for (const column of item.columns) {
      collectNumericSelectTargets(column.fields, pathPrefix, targets)
    }
    return
  }
  if (item.kind === 'row' || item.kind === 'group') {
    collectNumericSelectTargets(item.fields, pathPrefix, targets)
  }
}

function collectNumericSelectTargets(
  items: readonly (FormItem | RowConfig)[],
  pathPrefix: string,
  targets: NumericSelectTarget[],
): void {
  for (const item of items) {
    if (!('kind' in item)) {
      pushNumericSelectTarget(item, pathPrefix, targets)
      continue
    }
    collectFromContainer(item, pathPrefix, targets)
  }
}

function mergeNumericSelectTargets(fields: FormItem[]): NumericSelectTarget[] {
  const targets: NumericSelectTarget[] = []
  collectNumericSelectTargets(fields, '', targets)

  const topLevelTargets = flattenFields(fields).flatMap((field) => {
    const selectField = resolveNumericSelectField(field)
    if (!selectField || !isNumericSelectField(field)) return []
    const path = resolveFieldConfigPrimaryName(selectField)
    const optionValue = firstNumericOptionValue(selectField)
    return optionValue ? [{ path, optionValue }] : []
  })

  return [...targets, ...topLevelTargets].filter(
    (target, index, list) => list.findIndex((entry) => entry.path === target.path) === index,
  )
}

/**
 * Asserts numeric `select` / single `chips` option strings are accepted at each
 * field path without introducing new schema issues at that path (differential parse).
 */
export function assertNumericSelectStringValuesParse(
  schema: ZodType,
  fields: FormItem[],
  options: AssertNumericSelectStringValuesParseOptions = {},
): void {
  const mergedTargets = mergeNumericSelectTargets(fields)
  const baseline = structuredClone(
    (options.knownValidValues ?? buildDefaultValues(fields)) as Record<string, unknown>,
  )

  for (const target of mergedTargets) {
    const baselineResult = schema.safeParse(baseline)
    const baselineFieldIssues = issuesAtFieldPath(issuePaths(baselineResult), target.path)

    const mutated = structuredClone(baseline)
    setNestedFormValue(mutated, target.path, target.optionValue)
    const mutatedResult = schema.safeParse(mutated)
    const mutatedFieldIssues = issuesAtFieldPath(issuePaths(mutatedResult), target.path)

    const newIssues = [...mutatedFieldIssues].filter((path) => !baselineFieldIssues.has(path))
    expect(
      newIssues,
      `Numeric select "${target.path}" with UI string "${target.optionValue}" introduced validation issues: ${newIssues.join(', ')}`,
    ).toEqual([])
  }
}
