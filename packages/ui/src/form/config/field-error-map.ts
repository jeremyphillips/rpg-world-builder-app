import { fieldValidationMessages, midSentenceLabel, singularizeLabel } from '@rpg/contracts'

import type { FieldConfig, FormItem } from '../field-config'
import { fieldCategory } from './field-error-map-category.lib'
import { registerFieldPaths, type RegistryEntry } from './field-error-map-register.lib'

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
      registry.set(arrayKey, { label: item.legend, category: 'array' })
      registerItems(registry, `${arrayKey}.*`, item.fields)
    } else if (item.kind === 'slot') {
      // Slot content manages its own controls and messages.
    } else {
      registerItems(registry, prefix, item.fields)
    }
  }
}

/** Field lookup keyed by dot-joined path with array indices normalized to `*`. */
function buildFieldRegistry(items: FormItem[]): Map<string, RegistryEntry> {
  const registry = new Map<string, RegistryEntry>()
  registerItems(registry, '', items)
  return registry
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

function formatTooSmall(issue: RawZodIssueLike, entry: RegistryEntry): string | undefined {
  const min = Number(issue.minimum)
  const { label } = entry

  if (issue.origin === 'array') {
    if (min > 1) {
      return fieldValidationMessages.minItemsCount({ itemsLabel: midSentenceLabel(label), min })
    }
    return fieldValidationMessages.minItems({
      itemLabel: midSentenceLabel(singularizeLabel(label)),
    })
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

  return undefined
}

function formatInvalidType(issue: RawZodIssueLike, entry: RegistryEntry): string {
  const { label } = entry

  if (entry.category === 'number') {
    if (issue.expected === 'int') return fieldValidationMessages.integer({ label })
    return isEmptyInput(issue.input)
      ? fieldValidationMessages.requiredText({ label })
      : fieldValidationMessages.invalidNumber()
  }

  return entry.category === 'choice'
    ? fieldValidationMessages.requiredSelect({ label })
    : fieldValidationMessages.requiredText({ label })
}

function formatTooBig(issue: RawZodIssueLike, entry: RegistryEntry): string | undefined {
  const max = Number(issue.maximum)
  const { label } = entry

  if (issue.origin === 'string') return fieldValidationMessages.maxLength({ label, max })
  if (issue.origin === 'number' || issue.origin === 'int') {
    return fieldValidationMessages.maxNumber({ label, max })
  }
  return undefined
}

function formatInvalidValue(issue: RawZodIssueLike, entry: RegistryEntry): string | undefined {
  if (entry.category !== 'choice' && entry.category !== 'multi') return undefined

  return isEmptyInput(issue.input)
    ? fieldValidationMessages.requiredSelect({ label: entry.label })
    : fieldValidationMessages.invalidSelect({ label: entry.label })
}

const ISSUE_FORMATTERS: Record<
  string,
  (issue: RawZodIssueLike, entry: RegistryEntry) => string | undefined
> = {
  invalid_type: formatInvalidType,
  too_small: formatTooSmall,
  too_big: formatTooBig,
  invalid_value: formatInvalidValue,
  invalid_union: formatInvalidValue,
}

/**
 * Builds a Zod 4 per-parse error customizer for a form's field tree. Returning
 * `undefined` keeps Zod's default message, so unmapped paths and issue codes
 * degrade gracefully instead of throwing.
 */
export function makeFieldErrorMap(
  items: FormItem[],
): (issue: RawZodIssueLike) => string | undefined {
  const registry = buildFieldRegistry(items)

  return (issue) => {
    const entry = lookupEntry(registry, issue.path ?? [])
    if (!entry || issue.code === undefined) return undefined
    return ISSUE_FORMATTERS[issue.code]?.(issue, entry)
  }
}
