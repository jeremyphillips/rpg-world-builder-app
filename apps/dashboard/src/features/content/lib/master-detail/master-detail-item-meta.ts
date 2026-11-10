import { joinInlineMetadata } from '@rpg/contracts/primitives'

export interface MasterDetailItemMeta {
  /** Derived source name, shown only while a custom override hides it. */
  sourceName?: string
  /** Small label above the title region (e.g. "Level 3", "Grant"). */
  eyebrow?: string
  /** Source label such as "System" or "Homebrew". */
  sourceLabel: string
}

/** Joins structured meta parts for list rows and detail identity subtitles. */
export function joinMasterDetailItemMeta(meta: MasterDetailItemMeta): string {
  return joinInlineMetadata([meta.sourceName, meta.eyebrow, meta.sourceLabel])
}
