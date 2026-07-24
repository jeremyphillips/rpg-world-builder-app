import {
  assignStableContentIds,
  assertStableContentIds,
  ContentKeyError,
  deriveContentKey,
  type NestedIdRegeneration,
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

function forceRegenerateIdentifiedArray(
  rows: unknown[] | undefined,
  destinationSlug: string,
): unknown[] | undefined {
  if (rows === undefined) return undefined

  const usedIds = new Set<string>()
  return rows.filter(hasName).map((row) => {
    const { id: _id, name, ...rest } = row
    let id = deriveContentKey(`${destinationSlug}-${name}`)
    if (usedIds.has(id)) {
      let suffix = 2
      while (usedIds.has(`${id}-${suffix}`)) suffix += 1
      id = `${id}-${suffix}`
    }
    usedIds.add(id)

    const regenerated = { ...rest, name, id }
    if (!Array.isArray(row.options)) return regenerated

    return {
      ...regenerated,
      options: forceRegenerateIdentifiedArray(row.options, destinationSlug) ?? row.options,
    }
  })
}

function stableHeritageObject(incoming: unknown, existing?: unknown): unknown | undefined {
  if (incoming === undefined) return undefined
  if (!hasName(incoming)) return incoming

  const existingArray = existing !== undefined && hasName(existing) ? [existing] : undefined
  const stabilized = stableIdentifiedArray([incoming], existingArray)
  return stabilized?.[0] ?? incoming
}

function forceRegenerateHeritageObject(
  incoming: unknown,
  destinationSlug: string,
): unknown | undefined {
  if (incoming === undefined) return undefined
  if (!hasName(incoming)) return incoming

  const regenerated = forceRegenerateIdentifiedArray([incoming], destinationSlug)
  return regenerated?.[0] ?? incoming
}

type SpellResolutionEffect = { id: string; kind: string }
type SpellResolutionApplication = { effectId: string; amount: string }
type SpellResolutionOutcome = {
  applications?: SpellResolutionApplication[]
  [key: string]: unknown
}
type SpellResolutionBody = {
  effects?: SpellResolutionEffect[]
  outcomes?: SpellResolutionOutcome[]
  [key: string]: unknown
}

function regenerateSpellResolution(
  resolution: unknown,
  destinationSlug: string,
): SpellResolutionBody | undefined {
  if (typeof resolution !== 'object' || resolution === null) return undefined

  const body = resolution as SpellResolutionBody
  const effectIdMap = new Map<string, string>()

  const effects = (body.effects ?? []).map((effect, index) => {
    const newId = deriveContentKey(`${destinationSlug}-${effect.kind}-${index + 1}`)
    effectIdMap.set(effect.id, newId)
    return { ...effect, id: newId }
  })

  const outcomes = (body.outcomes ?? []).map((outcome) => ({
    ...outcome,
    applications: (outcome.applications ?? []).map((application) => ({
      ...application,
      effectId: effectIdMap.get(application.effectId) ?? application.effectId,
    })),
  }))

  return { ...body, effects, outcomes }
}

/**
 * Derives and assigns envelope slugs and nested trait/feature ids on create,
 * or preserves them on update. Only keys present in `body` are processed.
 */
export function applyStableNestedContentKeys(
  body: Record<string, unknown>,
  existingBody?: Record<string, unknown>,
): Record<string, unknown> {
  return normalizeNestedContentKeysForCreate(body, existingBody)
}

/** Create-time nested id assignment — preserves stable ids on update. */
export function normalizeNestedContentKeysForCreate(
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

export interface RegenerateNestedContentKeysContext {
  destinationSlug: string
  nestedIdRegeneration: NestedIdRegeneration
}

/**
 * Forces new nested authored ids for duplication — never preserves source ids,
 * even when they would be valid on create.
 */
export function regenerateNestedContentKeysForDuplicate(
  body: Record<string, unknown>,
  context: RegenerateNestedContentKeysContext,
): Record<string, unknown> {
  if (context.nestedIdRegeneration === 'none') return { ...body }

  const result = { ...body }

  for (const path of context.nestedIdRegeneration.paths) {
    if (path === 'features' || path === 'traits') {
      if (!(path in result) || !Array.isArray(result[path])) continue
      result[path] = forceRegenerateIdentifiedArray(
        result[path] as unknown[],
        context.destinationSlug,
      )
      continue
    }

    if (path === 'heritage') {
      if (!('heritage' in result)) continue
      result.heritage = forceRegenerateHeritageObject(result.heritage, context.destinationSlug)
      continue
    }

    if (path === 'resolution') {
      if (!('resolution' in result)) continue
      result.resolution = regenerateSpellResolution(result.resolution, context.destinationSlug)
    }
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
  mode: 'create' | 'update' | 'duplicate' = 'create',
): unknown {
  if (typeof raw !== 'object' || raw === null) return raw

  const input = { ...(raw as Record<string, unknown>) }

  if (mode === 'create' && typeof input.name === 'string') {
    input.slug = deriveContentKey(input.name)
  }

  if (mode === 'update') {
    delete input.slug
  }

  if (mode === 'duplicate') {
    return input
  }

  return normalizeNestedContentKeysForCreate(input, existingBody)
}

export { ContentKeyError }
