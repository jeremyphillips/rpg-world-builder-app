const STORAGE_PREFIX = 'rpg.form.groupCollapse.v1'

export interface GroupCollapseStoredValue {
  open: boolean
}

export function buildGroupCollapseStorageKey(uiStateKey: string, collapseKey: string): string {
  return `${STORAGE_PREFIX}:${uiStateKey}:${collapseKey}`
}

export function readGroupCollapseOpen(
  uiStateKey: string,
  collapseKey: string,
): boolean | undefined {
  try {
    const raw = localStorage.getItem(buildGroupCollapseStorageKey(uiStateKey, collapseKey))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as GroupCollapseStoredValue
    if (!parsed || typeof parsed !== 'object' || typeof parsed.open !== 'boolean') {
      return undefined
    }
    return parsed.open
  } catch {
    return undefined
  }
}

export function writeGroupCollapseOpen(
  uiStateKey: string,
  collapseKey: string,
  open: boolean,
): void {
  try {
    const payload: GroupCollapseStoredValue = { open }
    localStorage.setItem(
      buildGroupCollapseStorageKey(uiStateKey, collapseKey),
      JSON.stringify(payload),
    )
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}

/** Slug for collapse persistence when no explicit key or id is provided. */
export function slugifyGroupCollapseKey(legend: string): string {
  return legend
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
