import { slugSchema } from './envelope'

const FALLBACK_CONTENT_KEY = 'untitled'

/** Thrown when an update attempts to rename a stable nested content id. */
export class ContentKeyError extends Error {
  override readonly name = 'ContentKeyError'

  constructor(message: string) {
    super(message)
  }
}

/**
 * Normalizes a display name into a lowercase, hyphen-separated key fragment.
 * Does not guarantee `slugSchema` compliance — use `deriveContentKey` for that.
 */
export function slugifyName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function dedupeContentKey(base: string, used: ReadonlySet<string>): string {
  if (!used.has(base)) return base

  let suffix = 2
  while (used.has(`${base}-${suffix}`)) {
    suffix += 1
  }
  return `${base}-${suffix}`
}

/**
 * Derives a catalog slug or nested trait/feature id from a display name.
 * Validates against `slugSchema`; falls back to `untitled` when the name
 * produces no usable characters.
 */
export function deriveContentKey(name: string): string {
  const candidate = slugifyName(name) || FALLBACK_CONTENT_KEY
  return slugSchema.parse(candidate)
}

type IdentifiedRow = { id?: string; name: string }

/**
 * Assigns stable ids to nested rows (traits, features, heritage choices).
 *
 * - Rows whose `id` matches an existing id are kept as-is (name may change).
 * - New rows derive an id from `name`, deduped within the sibling set.
 */
export function assignStableContentIds<T extends IdentifiedRow>(
  rows: readonly T[],
  existing?: ReadonlyArray<{ id: string }>,
): Array<T & { id: string }> {
  const existingIds = new Set(existing?.map((row) => row.id) ?? [])
  const usedIds = new Set<string>()

  return rows.map((row) => {
    if (row.id !== undefined && existingIds.has(row.id)) {
      usedIds.add(row.id)
      return { ...row, id: row.id }
    }

    let id = deriveContentKey(row.name)
    id = dedupeContentKey(id, usedIds)
    usedIds.add(id)
    return { ...row, id }
  })
}

type StableIdentifiedRow = { id: string; name: string }

/**
 * Rejects updates that attempt to rename an existing nested id while keeping
 * the same display name (a rename-in-place attack). Deletions and genuinely new
 * rows (new name + new id) are allowed.
 */
export function assertStableContentIds(
  existing: readonly StableIdentifiedRow[],
  incoming: readonly StableIdentifiedRow[] | undefined,
): void {
  if (!incoming?.length || !existing.length) return

  const existingById = new Map(existing.map((row) => [row.id, row]))
  const existingByName = new Map(existing.map((row) => [row.name, row]))

  for (const row of incoming) {
    if (existingById.has(row.id)) continue

    const sameName = existingByName.get(row.name)
    if (sameName !== undefined && sameName.id !== row.id) {
      throw new ContentKeyError(
        `Cannot rename stable content id "${sameName.id}" to "${row.id}" for "${row.name}".`,
      )
    }
  }
}
