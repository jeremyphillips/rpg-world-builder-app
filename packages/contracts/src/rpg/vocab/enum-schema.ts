import { z } from 'zod'

import type { GameTermEntry } from './types'

export type TermOption = {
  readonly value: string
  readonly label: string
  readonly description?: string
}

export type FormatEnumDescriptionOptions = {
  /** Include per-value prose after each key. Default false for quieter JSON Schema hover. */
  showDescription?: boolean
}

/** Markdown bullet list of closed-set values for JSON Schema hover. */
export function formatClosedSetDescription(
  values: readonly string[],
  options: FormatEnumDescriptionOptions & {
    entries?: Record<string, GameTermEntry>
  } = {},
): string {
  const showDescription = options.showDescription ?? false
  const { entries } = options

  return values
    .map((value) => {
      const entry = entries?.[value]
      if (showDescription && entry) {
        return `- **${value}**: ${entry.description}`
      }
      return `- **${value}**`
    })
    .join('\n')
}

/** Hover copy for a discriminated union — surfaces branch keys without vocab entries. */
export function formatUnionBranchDescription(
  discriminant: string,
  branches: readonly string[],
): string {
  return `Branch on **${discriminant}**: ${branches.map((branch) => `**${branch}**`).join(' | ')}`
}

/** Markdown bullet list of enum values for Zod `.describe()`; promoted to `markdownDescription` in generated JSON Schema. */
export function formatEnumDescription(
  entries: Record<string, GameTermEntry>,
  options: FormatEnumDescriptionOptions = {},
): string {
  return formatClosedSetDescription(keysFromEntries(entries), { ...options, entries })
}

/** Derive a non-empty const tuple of ids from a vocab entries map (SSOT for closed sets). */
export function keysFromEntries<const T extends Record<string, GameTermEntry>>(
  entries: T,
): [keyof T & string, ...(keyof T & string)[]] {
  return Object.keys(entries) as [keyof T & string, ...(keyof T & string)[]]
}

/** Vocab-backed closed set: `z.enum` keys with a composite description from `*_ENTRIES`. */
export function vocabEnumFromEntries<const T extends Record<string, GameTermEntry>>(
  entries: T,
  options?: FormatEnumDescriptionOptions,
) {
  return z.enum(keysFromEntries(entries)).describe(formatEnumDescription(entries, options))
}

/** Structural closed set without vocab entries — value transparency only. */
export function closedSetEnum<const T extends readonly [string, ...string[]]>(
  values: T,
  options?: FormatEnumDescriptionOptions,
) {
  return z.enum(values).describe(formatClosedSetDescription(values, options))
}

/** Neutral option shape for forms and pickers — map to UI `FieldOption` in apps. */
export function termOptionsFromEntries<const T extends Record<string, GameTermEntry>>(
  entries: T,
): TermOption[] {
  return keysFromEntries(entries).map((value) => {
    const entry = entries[value]!
    return {
      value,
      label: entry.label,
      description: entry.description,
    }
  })
}
