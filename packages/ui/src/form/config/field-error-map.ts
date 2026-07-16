import { fieldValidationMessages, midSentenceLabel, singularizeLabel } from '@rpg/contracts'

import type { FieldConfig, FormItem } from '../field-config'
import { arrayItemLabel } from './array/array-item-label.lib'
import { fieldCategory } from './field-error-map-category.lib'
import { registerFieldPaths, type RegistryEntry } from './field-error-map-register.lib'
import { resolveArrayItemHeader } from './array/array-item-config.lib'

// ---------------------------------------------------------------------------
// Field-aware Zod error map (tier 1 of the validation-message architecture).
// Formats raw Zod issues (`invalid_type`, `too_small`, …) into the shared
// boilerplate copy from `@rpg/contracts`, using the field's configured label.
// Custom issues from `.refine` / `.superRefine` keep their domain message —
// Zod only consults this map when the issue has no message of its own.
// See packages/contracts/docs/validation-messages.md.
// ---------------------------------------------------------------------------

/**
 * The subset of Zod 4's raw issue shape the map reads. Duck-typed (like
 * `form-resolver.ts`) so it works even if the app and `@rpg/ui` resolve
 * different `zod` copies.
 */
export interface RawZodIssueLike {
  code?: string
  path?: PropertyKey[]
  input?: unknown
  expected?: string
  origin?: string
  format?: string
  exact?: boolean
  minimum?: number | bigint
  maximum?: number | bigint
}

function registerField(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  field: FieldConfig,
): void {
  registerFieldPaths(registry, prefix, field, fieldCategory(field))
}

function registerItems(
  registry: Map<string, RegistryEntry>,
  prefix: string,
  items: FormItem[],
): void {
  for (const item of items) {
    if (!('kind' in item)) {
      registerField(registry, prefix, item)
    } else if (item.kind === 'array') {
      const arrayKey = prefix ? `${prefix}.${item.name}` : item.name
      const header = resolveArrayItemHeader(item, item.legend)
      registry.set(arrayKey, {
        label: item.legend,
        category: 'array',
        itemLabel: arrayItemLabel(header, item.legend),
      })
      registerItems(registry, `${arrayKey}.*`, item.fields)
    } else if (item.kind === 'slot') {
      const slotKey = prefix ? `${prefix}.${item.name}` : item.name
      registry.set(slotKey, {
        label: item.label ?? item.name,
        category: 'text',
      })
    } else {
      registerItems(registry, prefix, item.fields)
    }
  }
}

/** Field lookup keyed by dot-joined path with array indices normalized to `*`. */
export function buildFieldRegistry(items: FormItem[]): Map<string, RegistryEntry> {
  const registry = new Map<string, RegistryEntry>()
  registerItems(registry, '', items)
  return registry
}

/** Registered dot-path keys for a form field tree (array indices use `*`). */
export function collectRegisteredPaths(items: FormItem[]): Set<string> {
  return new Set(buildFieldRegistry(items).keys())
}

/**
 * Nearest-field lookup: exact path first, then trailing segments dropped one at
 * a time so subpaths of composite values (`bonusGold.baseGp`, grid cells, dice
 * formula parts) resolve to their owning field config.
 */
function lookupEntry(
  registry: Map<string, RegistryEntry>,
  path: PropertyKey[],
): RegistryEntry | undefined {
  const segments = path.map((segment) => (typeof segment === 'number' ? '*' : String(segment)))

  for (let length = segments.length; length > 0; length--) {
    const entry = registry.get(segments.slice(0, length).join('.'))
    if (entry) return entry
  }

  return undefined
}

function isEmptyInput(input: unknown): boolean {
  return input === undefined || input === null || input === ''
}

function isChoiceCategory(category: RegistryEntry['category']): boolean {
  return category === 'choice' || category === 'multi'
}

function arrayItemsLabel(entry: RegistryEntry, form: 'singular' | 'plural'): string {
  if (form === 'plural') return midSentenceLabel(entry.label)
  return entry.itemLabel ?? midSentenceLabel(singularizeLabel(entry.label))
}

function formatTooSmall(issue: RawZodIssueLike, entry: RegistryEntry): string {
  const min = Number(issue.minimum)
  const { label } = entry

  if (issue.origin === 'array') {
    if (issue.exact) {
      return fieldValidationMessages.exactItemsCount({
        itemsLabel: arrayItemsLabel(entry, 'plural'),
        count: min,
      })
    }
    if (min > 1) {
      return fieldValidationMessages.minItemsCount({
        itemsLabel: arrayItemsLabel(entry, 'plural'),
        min,
      })
    }
    return fieldValidationMessages.minItems({ itemLabel: arrayItemsLabel(entry, 'singular') })
  }

  if (issue.origin === 'string') {
    if (min > 1) return fieldValidationMessages.minLength({ label, min })
    return entry.category === 'choice'
      ? fieldValidationMessages.requiredSelect({ label })
      : fieldValidationMessages.requiredText({ label })
  }

  if (issue.origin === 'number' || issue.origin === 'int') {
    return fieldValidationMessages.minNumber({ label, min })
  }

  return fieldValidationMessages.tooSmallGeneric({ label })
}

function formatInvalidType(issue: RawZodIssueLike, entry: RegistryEntry): string {
  const { label } = entry

  if (entry.category === 'number') {
    if (issue.expected === 'int') return fieldValidationMessages.integer({ label })
    return isEmptyInput(issue.input)
      ? fieldValidationMessages.requiredText({ label })
      : fieldValidationMessages.invalidNumber()
  }

  if (entry.category === 'boolean') {
    return fieldValidationMessages.requiredSelect({ label })
  }

  return entry.category === 'choice'
    ? fieldValidationMessages.requiredSelect({ label })
    : fieldValidationMessages.requiredText({ label })
}

function formatTooBig(issue: RawZodIssueLike, entry: RegistryEntry): string {
  const max = Number(issue.maximum)
  const { label } = entry

  if (issue.origin === 'array') {
    if (issue.exact) {
      return fieldValidationMessages.exactItemsCount({
        itemsLabel: arrayItemsLabel(entry, 'plural'),
        count: max,
      })
    }
  }

  if (issue.origin === 'string') return fieldValidationMessages.maxLength({ label, max })
  if (issue.origin === 'number' || issue.origin === 'int') {
    return fieldValidationMessages.maxNumber({ label, max })
  }

  return fieldValidationMessages.tooBigGeneric({ label })
}

function formatInvalidValue(issue: RawZodIssueLike, entry: RegistryEntry): string {
  if (isChoiceCategory(entry.category)) {
    return isEmptyInput(issue.input)
      ? fieldValidationMessages.requiredSelect({ label: entry.label })
      : fieldValidationMessages.invalidSelect({ label: entry.label })
  }

  return isEmptyInput(issue.input)
    ? formatInvalidType(issue, entry)
    : fieldValidationMessages.invalidValue({ label: entry.label })
}

function formatInvalidUnion(issue: RawZodIssueLike, entry: RegistryEntry): string {
  if (isChoiceCategory(entry.category)) {
    return formatInvalidValue(issue, entry)
  }

  return fieldValidationMessages.incompleteUnionOption()
}

function isSlugPath(path: PropertyKey[]): boolean {
  const last = path.at(-1)
  return last === 'slug' || last === 'id'
}

function formatInvalidFormat(
  issue: RawZodIssueLike,
  entry: RegistryEntry,
  path: PropertyKey[],
): string {
  if (issue.format === 'email') return fieldValidationMessages.invalidEmail()
  if (issue.format === 'url') return fieldValidationMessages.invalidUrl()
  if (issue.format === 'regex' && isSlugPath(path)) {
    return fieldValidationMessages.invalidSlug()
  }
  return fieldValidationMessages.invalidFormat({ label: entry.label })
}

const ISSUE_FORMATTERS: Record<
  string,
  (issue: RawZodIssueLike, entry: RegistryEntry, path: PropertyKey[]) => string | undefined
> = {
  invalid_type: (issue, entry) => formatInvalidType(issue, entry),
  too_small: (issue, entry) => formatTooSmall(issue, entry),
  too_big: (issue, entry) => formatTooBig(issue, entry),
  invalid_value: (issue, entry) => formatInvalidValue(issue, entry),
  invalid_union: (issue, entry) => formatInvalidUnion(issue, entry),
  invalid_format: (issue, entry, path) => formatInvalidFormat(issue, entry, path),
}

/**
 * Builds a Zod 4 per-parse error customizer for a form's field tree. Returning
 * `undefined` keeps Zod's default message for unregistered paths; registered
 * paths always receive catalog-backed copy (with a last-resort catch-all).
 */
export function makeFieldErrorMap(
  items: FormItem[],
): (issue: RawZodIssueLike) => string | undefined {
  const registry = buildFieldRegistry(items)

  return (issue) => {
    const path = issue.path ?? []
    const entry = lookupEntry(registry, path)
    if (!entry || issue.code === undefined) return undefined

    const formatted = ISSUE_FORMATTERS[issue.code]?.(issue, entry, path)
    if (formatted !== undefined) return formatted

    return fieldValidationMessages.invalidField({ label: entry.label })
  }
}
