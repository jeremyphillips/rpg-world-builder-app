import { expect } from 'vitest'
import type { ZodType } from 'zod'
import { formatFieldMessage, fieldValidationMessages } from '@rpg/contracts'

import { buildDefaultValues, flattenFields, type FormItem } from '../field-config'
import { buildFieldRegistry, makeFieldErrorMap } from '../config/field-error-map'
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
  /** Paths allowed to use generic discriminated-union copy. */
  unionWhitelist?: readonly (string | RegExp)[]
}

function normalizePath(path: readonly (string | number)[]): string {
  return path.map((segment) => (typeof segment === 'number' ? '*' : segment)).join('.')
}

function matchesPathPattern(path: string, patterns: readonly (string | RegExp)[]): boolean {
  return patterns.some((pattern) =>
    typeof pattern === 'string' ? pattern === path : pattern.test(path),
  )
}

function isPathRegistered(path: string, registry: Map<string, unknown>): boolean {
  const segments = path.split('.').filter(Boolean)
  for (let length = segments.length; length > 0; length--) {
    const key = segments.slice(0, length).join('.')
    if (registry.has(key)) return true
  }
  return false
}

function setByPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.')
  let cursor: Record<string, unknown> = target

  for (let index = 0; index < segments.length - 1; index++) {
    const segment = segments[index]!
    const existing = cursor[segment]
    if (typeof existing !== 'object' || existing === null || Array.isArray(existing)) {
      cursor[segment] = {}
    }
    cursor = cursor[segment] as Record<string, unknown>
  }

  cursor[segments.at(-1)!] = value
}

/** Builds defaults then clears required leaf fields to provoke validation failures. */
export function buildClearedRequiredDefaults(fields: FormItem[]): Record<string, unknown> {
  const values = { ...(buildDefaultValues(fields) as Record<string, unknown>) }

  for (const field of flattenFields(fields)) {
    if (!field.required) continue

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'richtext':
      case 'json':
        setByPath(values, field.name, '')
        break
      case 'number':
        setByPath(values, field.name, 0)
        break
      case 'chips':
      case 'combobox':
        setByPath(values, field.name, field.multiple ? [] : '')
        break
      case 'select':
      case 'radio':
      case 'radioCard':
        setByPath(values, field.name, '')
        break
      case 'checkbox':
      case 'switch':
        setByPath(values, field.name, false)
        break
      default:
        break
    }
  }

  return values
}

export function parseWithFieldErrorMap(schema: ZodType, value: unknown, fields: FormItem[]) {
  return schema.safeParse(value, { error: makeFieldErrorMap(fields) })
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
    if (!isPathRegistered(field.name, registry)) {
      missing.push(field.name)
    }
  }

  expect(missing, `Unregistered field paths: ${missing.join(', ')}`).toEqual([])
}

function isCatchAllMessage(message: string): boolean {
  return message.endsWith(' is invalid.')
}

function isUnionIncompleteMessage(message: string): boolean {
  return message === fieldValidationMessages.incompleteUnionOption()
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
  const unionWhitelist = options.unionWhitelist ?? []

  for (const issue of issues) {
    if (isCatchAllMessage(issue.message)) {
      expect(
        matchesPathPattern(issue.path, catchAllWhitelist),
        `Catch-all on non-whitelisted path ${issue.path}: ${issue.message}`,
      ).toBe(true)
    }

    if (isUnionIncompleteMessage(issue.message)) {
      expect(
        matchesPathPattern(issue.path, unionWhitelist),
        `Generic union copy on non-whitelisted path ${issue.path}`,
      ).toBe(true)
    }
  }
}
