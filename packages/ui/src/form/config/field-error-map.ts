import { fieldValidationMessages, midSentenceLabel, singularizeLabel } from '@rpg/contracts'
import type { ZodType } from 'zod'

import type { FormItem } from '../field-config'
import type { FieldMessageCategory } from './field-error-map-category.lib'
import type { RegistryEntry } from './field-error-map-register.lib'
import { registerFormItems } from './field-error-map-register-items.lib'

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

/** Field lookup keyed by dot-joined path with array indices normalized to `*`. */
export function buildFieldRegistry(items: FormItem[]): Map<string, RegistryEntry> {
  const registry = new Map<string, RegistryEntry>()
  registerFormItems(registry, '', items)
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

/** Label used when the issue path is not in the form field registry. */
export const UNLABELED_FIELD_LABEL = 'This field'
/** Generic singular item label for unregistered array minimums. */
export const UNLABELED_ITEM_LABEL = 'item'

function inferUnlabeledCategory(issue: RawZodIssueLike): FieldMessageCategory {
  if (issue.origin === 'array') return 'multi'
  if (
    issue.origin === 'number' ||
    issue.origin === 'int' ||
    issue.expected === 'number' ||
    issue.expected === 'int'
  ) {
    return 'number'
  }
  if (issue.expected === 'boolean') return 'boolean'
  return 'text'
}

function unlabeledEntry(issue: RawZodIssueLike): RegistryEntry {
  return {
    label: UNLABELED_FIELD_LABEL,
    category: inferUnlabeledCategory(issue),
    itemLabel: UNLABELED_ITEM_LABEL,
  }
}

/**
 * Builds a Zod 4 per-parse error customizer for a form's field tree. Known
 * issue codes always receive catalog-backed copy — registered paths use the
 * field label; unregistered paths use unlabeled fallbacks (`This field` /
 * `item`). Custom `.refine` / `.superRefine` messages stay on the issue and
 * are not rewritten here.
 */
export function makeFieldErrorMap(
  items: FormItem[],
): (issue: RawZodIssueLike) => string | undefined {
  const registry = buildFieldRegistry(items)

  return (issue) => {
    const path = issue.path ?? []
    const entry = lookupEntry(registry, path) ?? unlabeledEntry(issue)
    if (issue.code === undefined) {
      return fieldValidationMessages.invalidField({ label: entry.label })
    }

    const formatted = ISSUE_FORMATTERS[issue.code]?.(issue, entry, path)
    if (formatted !== undefined) return formatted

    return fieldValidationMessages.invalidField({ label: entry.label })
  }
}

/** `schema.safeParse` that always formats issues through {@link makeFieldErrorMap}. */
export function safeParseWithFieldErrors<T>(
  schema: ZodType<T>,
  values: unknown,
  items: FormItem[],
) {
  return schema.safeParse(values, { error: makeFieldErrorMap(items) })
}
