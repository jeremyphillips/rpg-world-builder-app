export interface MasterDetailItemMeta {
  /** Small label above the title region (e.g. "Level 3", "Grant"). */
  eyebrow?: string
  /** Source label such as "System" or "Homebrew". */
  sourceLabel: string
}

const MASTER_DETAIL_META_SEPARATOR = ' · '

/** Joins structured meta parts for list rows and detail identity subtitles. */
export function joinMasterDetailItemMeta(meta: MasterDetailItemMeta): string {
  return [meta.eyebrow, meta.sourceLabel]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(MASTER_DETAIL_META_SEPARATOR)
}
