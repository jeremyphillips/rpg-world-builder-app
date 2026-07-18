import { termOptionsFromEntries } from '../rpg/vocab/enum-schema'
import type { GameTermEntry } from '../rpg/vocab/types'

export type VocabOption = {
  value: string
  label: string
  description?: string
}

/** Neutral vocab → option mapping for apps to adapt to UI field options. */
export function toVocabOptions<const T extends Record<string, GameTermEntry>>(
  entries: T,
): VocabOption[] {
  return termOptionsFromEntries(entries)
}
