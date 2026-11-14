import { expect } from 'vitest'
import type { ZodType } from 'zod'
import { formatFieldMessage, fieldValidationMessages } from '@rpg/contracts'

import {
  buildDefaultValues,
  flattenFields,
  resolveFieldConfigBoundNames,
  resolveFieldConfigPrimaryName,
  type FieldConfig,
  type FormItem,
} from '../field-config'
import { makeFieldErrorMap, UNLABELED_FIELD_LABEL } from '../config/field-error-map'
import { buildFieldRegistry, lookupRegistryEntry } from '../config/field-registry.lib'
import { resolveArrayRowFields } from '../config/array/array-resolve-fields.lib'
import { prefixFormItems } from '../config/prefix-form-items.lib'
import {
  countIssueClaimTargets,
  groupIssuesForItemPrefix,
  resolveDirectArrayItemIndex,
} from '../errors/group-form-issues'
import { collectInactiveFieldPaths } from '../errors/resolve-field-error-presentation.lib'
import { prepareFormIssues } from '../errors/resolve-invalid-submit-navigation'
import type { FormIssue, FormIssueClaim } from '../errors/form-issue.types'
import type { RegistryEntry, RegistryEntryRole } from '../config/field-error-map-register.lib'
import {
  resolveTabValidationState,
  type TabValidationTab,
} from '../errors/resolve-tab-validation-state'
import { collectSchemaLeafPaths } from './collect-schema-paths.lib'

/** Patterns that indicate Zod's built-in default copy slipped through. */
export const ZOD_DEFAULT_MESSAGE_PATTERNS: readonly RegExp[] = [
  /^Invalid input/,
  /^Invalid input: expected/,
  /^Too small:/,
  /^Too big:/,
  /^Required$/,
  /^Expected /,
  /^Unrecognized key/,
]

export type ValidationIssue = {
  path: string
  message: string
}

export type IssueClaimReportEntry = {
  path: string
  message: string
  presentationPath: string
  claim: FormIssueClaim
  /** Registry role at the claim target, when the target is registered. */
  targetRole?: RegistryEntryRole
  severity: string
}

export type CollectIssueClaimReportOptions = {
  schema: ZodType
  values: unknown
  fields: FormItem[]
  /** When set, `fields` are relative and visibility reads this path in `values`. */
  fieldPathPrefix?: string
}

export type AssertRegistryCoverageOptions = {
  /** Schema paths that do not require tier-1 registration (tier-2/3 custom issues only). */
  exemptPaths?: readonly (string | RegExp)[]
  /** Schema paths omitted from the walk (e.g. server-only fields). */
  ignorePaths?: readonly (string | RegExp)[]
}

export type AssertInvalidSubmitOptions = AssertRegistryCoverageOptions & {
  invalidValue?: unknown
  /** Paths allowed to use the tier-1 catch-all (`{label} is invalid.`). */
  catchAllWhitelist?: readonly (string | RegExp)[]
}

function normalizePath(path: readonly (string | number)[]): string {
  return path.map((segment) => (typeof segment === 'number' ? '*' : segment)).join('.')
}

function matchesPathPattern(path: string, patterns: readonly (string | RegExp)[]): boolean {
  return patterns.some((pattern) =>
    typeof pattern === 'string' ? pattern === path : pattern.test(path),
  )
}

function isPathRegistered(path: string, registry: Map<string, RegistryEntry>): boolean {
  return lookupRegistryEntry(registry, path, { mode: 'prefix' }) !== undefined
}

function ensurePathChild(parent: unknown, key: string, nextIsIndex: boolean): unknown | undefined {
  if (Array.isArray(parent)) {
    const slot = Number(key)
    const existing = parent[slot]
    if (nextIsIndex) {
      if (!Array.isArray(existing)) parent[slot] = []
    } else if (!isPlainRecord(existing)) {
      parent[slot] = {}
    }
    return parent[slot]
  }

  if (!isPlainRecord(parent)) return undefined
  const existing = parent[key]
  if (nextIsIndex) {
    if (!Array.isArray(existing)) parent[key] = []
  } else if (!isPlainRecord(existing)) {
    parent[key] = {}
  }
  return parent[key]
}

function setByPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.')
  let cursor: unknown = target

  for (let index = 0; index < segments.length - 1; index++) {
    const segment = segments[index]!
    const nextIsIndex = /^\d+$/.test(segments[index + 1] ?? '')
    const next = ensurePathChild(cursor, segment, nextIsIndex)
    if (next === undefined) return
    cursor = next
  }

  const last = segments.at(-1)!
  if (Array.isArray(cursor)) {
    cursor[Number(last)] = value
    return
  }
  if (isPlainRecord(cursor)) cursor[last] = value
}

type FlatField = ReturnType<typeof flattenFields>[number]

const CLEARED_VALUE_BY_TYPE: Record<string, (field: FlatField) => unknown> = {
  text: () => '',
  textarea: () => '',
  richtext: () => '',
  json: () => '',
  select: () => '',
  radio: () => '',
  radioCard: () => '',
  number: () => 0,
  checkbox: () => false,
  switch: () => false,
  chips: (field) => ('multiple' in field && field.multiple ? [] : ''),
  combobox: (field) => ('multiple' in field && field.multiple ? [] : ''),
}

/** Builds defaults then clears required leaf fields to provoke validation failures. */
export function buildClearedRequiredDefaults(fields: FormItem[]): Record<string, unknown> {
  const values = { ...(buildDefaultValues(fields) as Record<string, unknown>) }

  for (const field of flattenFields(fields)) {
    if (!field.required) continue

    const clearedValue = CLEARED_VALUE_BY_TYPE[field.type]
    if (clearedValue) setByPath(values, resolveFieldConfigPrimaryName(field), clearedValue(field))
  }

  return values
}

export function parseWithFieldErrorMap(schema: ZodType, value: unknown, fields: FormItem[]) {
  const formValues =
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined
  return schema.safeParse(value, { error: makeFieldErrorMap(fields, formValues) })
}

export function collectIssueClaimReport(
  options: CollectIssueClaimReportOptions,
): IssueClaimReportEntry[] {
  const result = parseWithFieldErrorMap(options.schema, options.values, options.fields)
  if (result.success) return []

  const formValues =
    typeof options.values === 'object' && options.values !== null
      ? (options.values as Record<string, unknown>)
      : {}
  const routed = prepareFormIssues(result.error.issues, options.fields, formValues, {
    fieldPathPrefix: options.fieldPathPrefix,
  })
  const absoluteFields = options.fieldPathPrefix
    ? prefixFormItems(options.fields, options.fieldPathPrefix)
    : options.fields
  const registry = buildFieldRegistry(absoluteFields, formValues)

  return routed.map((issue) => {
    const claim = issue.claim ?? { kind: 'form' as const, target: 'form' }
    return {
      path: issue.path,
      message: issue.message,
      presentationPath: issue.presentationPath ?? issue.path,
      claim,
      targetRole: lookupRegistryEntry(registry, claim.target, { mode: 'exact' })?.entry.role,
      severity: issue.severity,
    }
  })
}

export function collectValidationIssues(
  schema: ZodType,
  value: unknown,
  fields: FormItem[],
): ValidationIssue[] {
  const result = parseWithFieldErrorMap(schema, value, fields)
  if (result.success) return []

  return result.error.issues.map((issue) => ({
    path: normalizePath(issue.path as (string | number)[]),
    message: formatFieldMessage(issue.message),
  }))
}

export function expectNoDefaultZodMessages(messages: readonly string[]): void {
  for (const message of messages) {
    for (const pattern of ZOD_DEFAULT_MESSAGE_PATTERNS) {
      expect(message, `Zod default message: ${message}`).not.toMatch(pattern)
    }
  }
}

/** Asserts every schema leaf path resolves to a field-error-map registry entry. */
export function assertRegistryCoverage(
  schema: ZodType,
  fields: FormItem[],
  options: AssertRegistryCoverageOptions = {},
): void {
  const registry = buildFieldRegistry(fields)
  const exempt = options.exemptPaths ?? []
  const ignore = options.ignorePaths ?? [/^_/]

  const uncovered: string[] = []

  for (const path of collectSchemaLeafPaths(schema)) {
    if (matchesPathPattern(path, ignore)) continue
    if (matchesPathPattern(path, exempt)) continue
    if (!isPathRegistered(path, registry)) uncovered.push(path)
  }

  expect(uncovered, `Unregistered schema paths: ${uncovered.join(', ')}`).toEqual([])
}

/** Asserts every leaf field config path is registered in the error map. */
export function assertFieldPathsRegistered(items: FormItem[]): void {
  const registry = buildFieldRegistry(items)
  const missing: string[] = []

  for (const field of flattenFields(items)) {
    for (const path of resolveFieldConfigBoundNames(field)) {
      if (!isPathRegistered(path, registry)) {
        missing.push(path)
      }
    }
  }

  expect(missing, `Unregistered field paths: ${missing.join(', ')}`).toEqual([])
}

function isCatchAllMessage(message: string): boolean {
  return message.endsWith(' is invalid.')
}

/** Parses invalid payloads and asserts refined copy (no Zod defaults / disallowed generics). */
export function assertInvalidSubmitUsesRefinedMessages(
  schema: ZodType,
  fields: FormItem[],
  options: AssertInvalidSubmitOptions = {},
): void {
  const candidates = [options.invalidValue, {}, buildClearedRequiredDefaults(fields)].filter(
    (value) => value !== undefined,
  )

  let issues: ValidationIssue[] = []
  for (const value of candidates) {
    issues = collectValidationIssues(schema, value, fields)
    if (issues.length > 0) break
  }

  expect(issues.length, 'expected at least one validation issue').toBeGreaterThan(0)
  expectNoDefaultZodMessages(issues.map((issue) => issue.message))

  const catchAllWhitelist = options.catchAllWhitelist ?? []

  for (const issue of issues) {
    if (isCatchAllMessage(issue.message)) {
      expect(
        matchesPathPattern(issue.path, catchAllWhitelist),
        `Catch-all on non-whitelisted path ${issue.path}: ${issue.message}`,
      ).toBe(true)
    }
  }
}

const UNLABELED_REQUIRED = fieldValidationMessages.requiredUnlabeled()

/** Field-severity issues must land on a control or a slot that owns issue paths. */
export function expectIssuesClaimedByControls(report: readonly IssueClaimReportEntry[]): void {
  const missed = report.filter((entry) => {
    if (entry.severity !== 'field') return false
    if (entry.targetRole === 'control' || entry.targetRole === 'slotOwner') return false
    return !(entry.targetRole === 'array' && entry.claim.target === entry.path)
  })
  expect(missed, `Unclaimed field issues:\n${JSON.stringify(missed, null, 2)}`).toEqual([])
}

/** Rejects unlabeled tier-1 copy (`This field`, bare `Required.`) on field issues. */
export function expectLabeledIssueCopy(report: readonly IssueClaimReportEntry[]): void {
  for (const entry of report) {
    if (entry.severity !== 'field') continue
    expect(entry.message.startsWith(UNLABELED_FIELD_LABEL), entry.path).toBe(false)
    expect(entry.message, entry.path).not.toBe(formatFieldMessage(UNLABELED_REQUIRED))
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readPath(target: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.')
  let cursor: unknown = target
  for (const segment of segments) {
    if (Array.isArray(cursor)) {
      cursor = cursor[Number(segment)]
      continue
    }
    if (!isPlainRecord(cursor)) return undefined
    cursor = cursor[segment]
  }
  return cursor
}

/**
 * Overlays registered control defaults onto a row: empty strings from
 * {@link buildDefaultValues} for unset text and choice controls, and `{ dice: {} }`
 * for incomplete roll values.
 */
export function toRegisteredFormShape(row: unknown, fields: FormItem[]): unknown {
  const record = isPlainRecord(row) ? structuredClone(row) : {}
  const inactive = collectInactiveFieldPaths([...fields], record)
  applyRegisteredShape(record, fields, inactive)
  return record
}

function isInactiveControl(path: string, inactive: ReadonlySet<string>): boolean {
  for (const inactivePath of inactive) {
    if (path === inactivePath || path.startsWith(`${inactivePath}.`)) return true
  }
  return false
}

function applyRegisteredArrayItem(
  record: Record<string, unknown>,
  item: Extract<FormItem, { kind: 'array' }>,
  inactive: ReadonlySet<string>,
): void {
  const rows = record[item.name]
  const list = Array.isArray(rows) ? rows : []
  record[item.name] = list.map((row, index) => {
    const rowFields = item.item?.resolveFields
      ? resolveArrayRowFields(item, row, index)
      : item.fields
    const next = isPlainRecord(row) ? structuredClone(row) : {}
    applyRegisteredShape(next, rowFields, inactive)
    return next
  })
}

function applyRegisteredStructuredItem(
  record: Record<string, unknown>,
  item: Extract<FormItem, { kind: string }>,
  inactive: ReadonlySet<string>,
): void {
  switch (item.kind) {
    case 'array':
      applyRegisteredArrayItem(record, item, inactive)
      return
    case 'dependent':
      applyRegisteredShape(record, [item.controller, ...item.dependents.fields], inactive)
      return
    case 'columns':
      for (const column of item.columns) applyRegisteredShape(record, column.fields, inactive)
      return
    case 'group':
    case 'row':
      applyRegisteredShape(record, item.fields as FormItem[], inactive)
  }
}

function applyRegisteredShape(
  record: Record<string, unknown>,
  items: readonly FormItem[],
  inactive: ReadonlySet<string>,
): void {
  for (const item of items) {
    if (!('kind' in item)) {
      const name = resolveFieldConfigPrimaryName(item)
      if (name && isInactiveControl(name, inactive)) continue
      applyFieldShape(record, item)
      continue
    }

    applyRegisteredStructuredItem(record, item, inactive)
  }
}

function applyFieldShape(record: Record<string, unknown>, field: FieldConfig): void {
  const name = resolveFieldConfigPrimaryName(field)

  if (field.type === 'rollValue') {
    const current = readPath(record, name)
    const dice = isPlainRecord(current) ? current.dice : undefined
    const diceRecord = isPlainRecord(dice) ? dice : undefined
    if (typeof diceRecord?.count === 'number' && typeof diceRecord.faces === 'number') return
    setByPath(record, name, {
      ...(isPlainRecord(current) ? current : {}),
      dice: {},
    })
    return
  }

  const defaults = buildDefaultValues([field])
  const fallback = defaults[name]
  if (typeof fallback !== 'string') return
  if (readPath(record, name) !== undefined) return
  setByPath(record, name, fallback)
}

export type IssueCountParityInput = {
  issues: readonly FormIssue[]
  tabs: readonly TabValidationTab[]
  fields: FormItem[]
  tabId: string
  arrayPath: string
  expectedCount: number
}

/** Tab count, summed row counts, and distinct control targets match. */
export function expectIssueCountParity(input: IssueCountParityInput): void {
  const tabCount =
    resolveTabValidationState(input.issues, input.tabs, input.fields).find(
      (state) => state.tabId === input.tabId,
    )?.count ?? 0

  const indexes = new Set<number>()
  for (const issue of input.issues) {
    const index = resolveDirectArrayItemIndex(issue, input.arrayPath)
    if (index !== undefined) indexes.add(index)
  }

  let rowSum = 0
  for (const index of indexes) {
    rowSum += groupIssuesForItemPrefix(
      [...input.issues],
      `${input.arrayPath}.${index}`,
      input.arrayPath,
      index,
      [],
    ).totalCount
  }

  const arrayIssues = input.issues.filter(
    (issue) => issue.path === input.arrayPath || issue.path.startsWith(`${input.arrayPath}.`),
  )
  const controlTargets = new Set(
    arrayIssues
      .filter((issue) => issue.claim?.kind === 'field' || issue.claim?.kind === 'slot')
      .map((issue) => issue.claim?.target)
      .filter((target): target is string => Boolean(target)),
  )

  expect(tabCount).toBe(input.expectedCount)
  expect(rowSum).toBe(input.expectedCount)
  expect(controlTargets.size).toBe(input.expectedCount)
  expect(countIssueClaimTargets(arrayIssues)).toBe(input.expectedCount)
}
