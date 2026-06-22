import {
  assignStableContentIds,
  assertStableContentIds,
  ContentKeyError,
  deriveContentKey,
} from '@rpg/contracts'

const STABLE_ID_ARRAY_KEYS = ['features', 'traits'] as const

type IdentifiedRow = { id?: string; name: string; options?: unknown[] }

function hasName(value: unknown): value is IdentifiedRow {
  return (
    typeof value === 'object' && value !== null && typeof (value as IdentifiedRow).name === 'string'
  )
}

function hasStableId(value: unknown): value is { id: string; name: string } {
  return hasName(value) && typeof value.id === 'string' && value.id.length > 0
}

function stableIdentifiedArray(
  incoming: unknown[] | undefined,
  existing?: unknown[],
): unknown[] | undefined {
  if (incoming === undefined) return undefined

  const existingRows = (existing ?? []).filter(hasStableId)
  const incomingRows = incoming.filter(hasName)

  if (existingRows.length) {
    assertStableContentIds(existingRows, incoming.filter(hasStableId))
  }

  return assignStableContentIds(incomingRows, existingRows).map((row) => {
    if (!Array.isArray(row.options)) return row

    const existingRow = existingRows.find((candidate) => candidate.id === row.id)
    const existingOptions =
      existingRow && 'options' in existingRow && Array.isArray(existingRow.options)
        ? existingRow.options
        : undefined

    return {
      ...row,
      options: stableIdentifiedArray(row.options, existingOptions) ?? row.options,
    }
  })
}

function stableHeritageObject(incoming: unknown, existing?: unknown): unknown | undefined {
  if (incoming === undefined) return undefined
  if (!hasName(incoming)) return incoming

  const existingHeritage = hasStableId(existing) ? existing : undefined
  if (existingHeritage) {
    assertStableContentIds(
      [incoming].filter(hasStableId),
      existingHeritage ? [existingHeritage] : [],
    )
  }

  const assigned = assignStableContentIds(
    [incoming],
    existingHeritage ? [existingHeritage] : [],
  ) as IdentifiedRow[]

  const withId = assigned[0]
  if (!withId) return incoming

  if (!Array.isArray(withId.options)) return withId

  const existingOptions =
    existingHeritage && 'options' in existingHeritage && Array.isArray(existingHeritage.options)
      ? existingHeritage.options
      : undefined

  return {
    ...withId,
    options: stableIdentifiedArray(withId.options, existingOptions) ?? withId.options,
  }
}

/**
 * Derives and assigns envelope slugs and nested trait/feature ids on create,
 * or preserves them on update. Only keys present in `body` are processed.
 */
export function applyStableNestedContentKeys(
  body: Record<string, unknown>,
  existingBody?: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...body }

  for (const key of STABLE_ID_ARRAY_KEYS) {
    if (!(key in result) || !Array.isArray(result[key])) continue
    const existing = existingBody?.[key]
    const existingArray = Array.isArray(existing) ? existing : undefined
    result[key] = stableIdentifiedArray(result[key] as unknown[], existingArray)
  }

  if ('heritage' in result) {
    const existing = existingBody?.heritage
    result.heritage = stableHeritageObject(result.heritage, existing)
  }

  return result
}

/** Derives the envelope slug from the create input name (client slug is ignored). */
export function deriveEnvelopeSlugFromInput(input: Record<string, unknown>): string {
  const name = input.name
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Create input must include a non-empty name.')
  }
  return deriveContentKey(name)
}

/**
 * Normalizes homebrew write payloads before Zod validation: derives envelope slug
 * and nested ids on create, strips slug and enforces stable nested ids on update.
 */
export function normalizeHomebrewWriteInput(
  raw: unknown,
  existingBody?: Record<string, unknown>,
  mode: 'create' | 'update' = 'create',
): unknown {
  if (typeof raw !== 'object' || raw === null) return raw

  const input = { ...(raw as Record<string, unknown>) }

  if (mode === 'create' && typeof input.name === 'string') {
    input.slug = deriveContentKey(input.name)
  }

  if (mode === 'update') {
    delete input.slug
  }

  return applyStableNestedContentKeys(input, existingBody)
}

export { ContentKeyError }
