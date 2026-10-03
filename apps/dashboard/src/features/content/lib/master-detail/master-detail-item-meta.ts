import { joinInlineMetadata } from '@rpg/contracts/primitives'

export interface MasterDetailItemMeta {
  /** Small label above the title region (e.g. "Level 3", "Grant"). */
  eyebrow?: string
  /** Source label such as "System" or "Homebrew". */
  sourceLabel: string
}

/** Joins structured meta parts for list rows and detail identity subtitles. */
export function joinMasterDetailItemMeta(meta: MasterDetailItemMeta): string {
  return joinInlineMetadata([meta.eyebrow, meta.sourceLabel])
}
