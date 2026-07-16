import { DND_BEYOND_SRD_TOOL_RULESET_ID } from './dnd-beyond-tool-mapping'

// ---------------------------------------------------------------------------
// Shared catalog name → local slug/id resolution for D&D Beyond imports.
// ---------------------------------------------------------------------------

export type DndBeyondCatalogNameEntry = {
  name: string
  slug: string
}

export type DndBeyondCatalogNameIndex = ReadonlyMap<string, string>

export function normalizeDndBeyondCatalogLookupKey(value: string): string {
  return value.trim().toLowerCase()
}

export function dndBeyondCatalogLookupKeys(value: string): string[] {
  const trimmed = value.trim()
  const keys = [normalizeDndBeyondCatalogLookupKey(trimmed)]
  const withoutParens = trimmed.replace(/\s*\([^)]*\)\s*$/, '').trim()

  if (withoutParens && withoutParens !== trimmed) {
    keys.push(normalizeDndBeyondCatalogLookupKey(withoutParens))
  }

  return keys
}

export function createDndBeyondCatalogNameIndex(
  entries: readonly DndBeyondCatalogNameEntry[],
): DndBeyondCatalogNameIndex {
  const index = new Map<string, string>()

  for (const entry of entries) {
    index.set(normalizeDndBeyondCatalogLookupKey(entry.name), entry.slug)
  }

  return index
}

export function resolveLocalCatalogSlugFromName(
  name: string,
  index: DndBeyondCatalogNameIndex,
): string | undefined {
  for (const key of dndBeyondCatalogLookupKeys(name)) {
    const slug = index.get(key)
    if (slug) return slug
  }

  return undefined
}

export function toLocalCatalogId(
  slug: string,
  rulesetId: string = DND_BEYOND_SRD_TOOL_RULESET_ID,
): string {
  return `${rulesetId}:${slug}`
}

export function resolveLocalCatalogMatchFromName(
  name: string,
  index: DndBeyondCatalogNameIndex,
): { localSlug: string; localValue: string } | undefined {
  const localSlug = resolveLocalCatalogSlugFromName(name, index)
  if (!localSlug) return undefined

  return {
    localSlug,
    localValue: toLocalCatalogId(localSlug),
  }
}
