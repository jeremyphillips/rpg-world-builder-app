import type { ArrayItemCollapseOverride } from './array-item-collapse.lib'

const STORAGE_PREFIX = 'rpg.form.arrayCollapse.v1'

export interface ArrayItemCollapseStoredValue {
  overrides: Record<string, ArrayItemCollapseOverride>
}

export function buildArrayItemCollapseStorageKey(uiStateKey: string, fullName: string): string {
  return `${STORAGE_PREFIX}:${uiStateKey}:${fullName}`
}

export function readArrayItemCollapseOverrides(
  uiStateKey: string,
  fullName: string,
): Record<string, ArrayItemCollapseOverride> | undefined {
  try {
    const raw = localStorage.getItem(buildArrayItemCollapseStorageKey(uiStateKey, fullName))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as ArrayItemCollapseStoredValue
    if (!parsed || typeof parsed !== 'object' || !parsed.overrides) return undefined
    return parsed.overrides
  } catch {
    return undefined
  }
}

export function writeArrayItemCollapseOverrides(
  uiStateKey: string,
  fullName: string,
  overrides: Record<string, ArrayItemCollapseOverride>,
): void {
  try {
    const payload: ArrayItemCollapseStoredValue = { overrides }
    localStorage.setItem(
      buildArrayItemCollapseStorageKey(uiStateKey, fullName),
      JSON.stringify(payload),
    )
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}
