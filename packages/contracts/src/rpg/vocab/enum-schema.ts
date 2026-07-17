import { z } from 'zod'

import type { GameTermEntry } from './types'

export type TermOption = {
  readonly value: string
  readonly label: string
  readonly description?: string
}

/** Markdown bullet list of enum values for Zod `.describe()` and JSON Schema hover. */
export function formatEnumDescription(entries: Record<string, GameTermEntry>): string {
  return Object.entries(entries)
    .map(([key, entry]) => `- **${key}**: ${entry.description}`)
    .join('\n')
}

/** Vocab-backed closed set: `z.enum` keys with a composite description from `*_ENTRIES`. */
export function vocabEnumFromEntries<const T extends Record<string, GameTermEntry>>(entries: T) {
  const keys = Object.keys(entries) as [keyof T & string, ...(keyof T & string)[]]
  return z.enum(keys).describe(formatEnumDescription(entries))
}

/** Neutral option shape for forms and pickers — map to UI `FieldOption` in apps. */
export function termOptionsFromEntries<const T extends Record<string, GameTermEntry>>(
  entries: T,
): TermOption[] {
  return (Object.keys(entries) as Array<keyof T & string>).map((value) => {
    const entry = entries[value]!
    return {
      value,
      label: entry.label,
      description: entry.description,
    }
  })
}
