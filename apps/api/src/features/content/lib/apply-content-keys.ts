import { randomUUID } from 'node:crypto'

import {
  assignStableContentIds,
  assertStableContentIds,
  ContentKeyError,
  createGrantRowId,
  createOrganizationMembershipTitleId,
  deriveContentKey,
  isSeedGrantRowId,
  type NestedContentIdRegenerationPath,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function matchStoredRow(incoming: unknown, stored: unknown[] | undefined): unknown {
  if (!stored || !isRecord(incoming) || typeof incoming.id !== 'string') return undefined
  return stored.find((row) => isRecord(row) && row.id === incoming.id)
}

function indexStoredGrantKinds(groups: unknown[]): Map<string, string> {
  const stored = new Map<string, string>()
  for (const group of groups) {
    if (!isRecord(group) || !Array.isArray(group.grants)) continue
    for (const grant of group.grants) {
      if (!isRecord(grant) || typeof grant.id !== 'string' || typeof grant.kind !== 'string') {
        continue
      }
      stored.set(grant.id, grant.kind)
    }
  }
  return stored
}

function assertStoredGrantKind(
  id: string,
  kind: string | undefined,
  storedKind: string | undefined,
) {
  if (kind !== undefined && storedKind !== kind) {
    throw new ContentKeyError(`Cannot reuse grant row id "${id}" for a different grant kind.`)
  }
}

function assertNewGrantId(id: string) {
  if (isSeedGrantRowId(id)) {
    throw new ContentKeyError(
      `Cannot assign seed grant row id "${id}" to a grant that is not already stored.`,
    )
  }
}

function resolveStabilizedGrantId(
  grant: Record<string, unknown>,
  storedKinds: Map<string, string>,
): string {
  const kind = typeof grant.kind === 'string' ? grant.kind : undefined
  const incomingId = typeof grant.id === 'string' && grant.id.length > 0 ? grant.id : undefined
  if (incomingId === undefined) return createGrantRowId()

  if (storedKinds.has(incomingId)) {
    assertStoredGrantKind(incomingId, kind, storedKinds.get(incomingId))
    return incomingId
  }

  assertNewGrantId(incomingId)
  return incomingId
}

function rememberGrantRowId(id: string, seen: Set<string>) {
  if (seen.has(id)) {
    throw new ContentKeyError(`Duplicate grant row id "${id}".`)
  }
  seen.add(id)
}

function stabilizeGrant(
  grant: unknown,
  storedKinds: Map<string, string>,
  seen: Set<string>,
): unknown {
  if (!isRecord(grant)) return grant
  const id = resolveStabilizedGrantId(grant, storedKinds)
  rememberGrantRowId(id, seen)
  return { ...grant, id }
}

function stabilizeGrantGroup(
  group: unknown,
  storedKinds: Map<string, string>,
  seen: Set<string>,
): unknown {
  if (!isRecord(group) || !Array.isArray(group.grants)) return group
  return {
    ...group,
    grants: group.grants.map((grant) => stabilizeGrant(grant, storedKinds, seen)),
  }
}

/**
 * Allocates missing grant row ids and rejects reuse. Compared against the stored
 * owner (the effective body on system-patch updates).
 */
function stabilizeGrantGroups(
  incomingGroups: unknown[],
  storedGroups: unknown[] | undefined,
): unknown[] {
  const storedKinds = storedGroups ? indexStoredGrantKinds(storedGroups) : new Map<string, string>()
  const seen = new Set<string>()
  return incomingGroups.map((group) => stabilizeGrantGroup(group, storedKinds, seen))
}

const GRANT_OWNER_ARRAY_KEYS = ['traits', 'features', 'options'] as const

function stabilizeOwnedGrantGroups(
  next: Record<string, unknown>,
  storedRecord: Record<string, unknown> | undefined,
) {
  if (!Array.isArray(next.grantGroups)) return
  const storedGroups =
    storedRecord && Array.isArray(storedRecord.grantGroups) ? storedRecord.grantGroups : undefined
  next.grantGroups = stabilizeGrantGroups(next.grantGroups, storedGroups)
}

function stabilizeNestedGrantOwners(
  next: Record<string, unknown>,
  storedRecord: Record<string, unknown> | undefined,
  key: (typeof GRANT_OWNER_ARRAY_KEYS)[number],
) {
  if (!Array.isArray(next[key])) return
  const storedRows =
    storedRecord && Array.isArray(storedRecord[key]) ? storedRecord[key] : undefined
  next[key] = next[key].map((row) => stabilizeGrantOwners(row, matchStoredRow(row, storedRows)))
}

function stabilizeGrantOwners(incoming: unknown, stored: unknown): unknown {
  if (!isRecord(incoming)) return incoming

  const next: Record<string, unknown> = { ...incoming }
  const storedRecord = isRecord(stored) ? stored : undefined
  stabilizeOwnedGrantGroups(next, storedRecord)
  for (const key of GRANT_OWNER_ARRAY_KEYS) {
    stabilizeNestedGrantOwners(next, storedRecord, key)
  }
  if (isRecord(next.heritage)) {
    next.heritage = stabilizeGrantOwners(next.heritage, storedRecord?.heritage)
  }
  return next
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

  return stabilizeGrantOwners(result, existingBody) as Record<string, unknown>
}

export interface RegenerateNestedContentKeysContext {
  destinationSlug: string
  nestedIdRegeneration: NestedIdRegeneration
}

function regenerateFeaturesOrTraitsPathForDuplicate(
  result: Record<string, unknown>,
  path: 'features' | 'traits',
  destinationSlug: string,
): void {
  if (!(path in result) || !Array.isArray(result[path])) return
  result[path] = forceRegenerateIdentifiedArray(result[path] as unknown[], destinationSlug)
}

function regenerateHeritagePathForDuplicate(
  result: Record<string, unknown>,
  destinationSlug: string,
): void {
  if (!('heritage' in result)) return
  result.heritage = forceRegenerateHeritageObject(result.heritage, destinationSlug)
}

function regenerateResolutionPathForDuplicate(
  result: Record<string, unknown>,
  destinationSlug: string,
): void {
  if (!('resolution' in result)) return
  result.resolution = regenerateSpellResolution(result.resolution, destinationSlug)
}

type OrganizationLocationConnectionRow = {
  id: string
  locationId: string
  kind: string
}

function regenerateConnectionsLocationsPathForDuplicate(result: Record<string, unknown>): void {
  if (!('connections' in result)) return
  const connections = result.connections
  if (typeof connections !== 'object' || connections === null) return

  const locations = (connections as { locations?: unknown }).locations
  if (!Array.isArray(locations)) return

  result.connections = {
    ...connections,
    locations: locations.map((row) => {
      if (typeof row !== 'object' || row === null) return row
      const connection = row as OrganizationLocationConnectionRow
      return {
        ...connection,
        id: randomUUID(),
      }
    }),
  }
}

function regenerateStartingEquipmentPathForDuplicate(result: Record<string, unknown>): void {
  if (!('characterCreation' in result)) return
  const characterCreation = result.characterCreation
  if (typeof characterCreation !== 'object' || characterCreation === null) return

  const startingEquipment = (characterCreation as { startingEquipment?: unknown }).startingEquipment
  if (typeof startingEquipment !== 'object' || startingEquipment === null) return

  const options = (startingEquipment as { options?: unknown }).options
  if (!Array.isArray(options)) return

  result.characterCreation = {
    ...characterCreation,
    startingEquipment: {
      ...startingEquipment,
      options: options.map((option) => {
        if (typeof option !== 'object' || option === null) return option
        const items = (option as { items?: unknown }).items
        if (!Array.isArray(items)) return option
        return {
          ...option,
          items: items.map((item) => {
            if (typeof item !== 'object' || item === null) return item
            return { ...item, id: randomUUID() }
          }),
        }
      }),
    },
  }
}

function regenerateMembersTitlesPathForDuplicate(result: Record<string, unknown>): void {
  if (!('members' in result)) return
  const members = result.members
  if (typeof members !== 'object' || members === null) return

  const titles = (members as { titles?: unknown }).titles
  if (!Array.isArray(titles)) return

  result.members = {
    ...members,
    titles: titles.map((title) => {
      if (typeof title !== 'object' || title === null) return title
      return { ...title, id: createOrganizationMembershipTitleId() }
    }),
  }
}

function regenerateNestedPathForDuplicate(
  result: Record<string, unknown>,
  path: NestedContentIdRegenerationPath,
  destinationSlug: string,
): void {
  switch (path) {
    case 'features':
    case 'traits':
      regenerateFeaturesOrTraitsPathForDuplicate(result, path, destinationSlug)
      return
    case 'heritage':
      regenerateHeritagePathForDuplicate(result, destinationSlug)
      return
    case 'resolution':
      regenerateResolutionPathForDuplicate(result, destinationSlug)
      return
    case 'connections.locations':
      regenerateConnectionsLocationsPathForDuplicate(result)
      return
    case 'members.titles':
      regenerateMembersTitlesPathForDuplicate(result)
      return
    case 'characterCreation.startingEquipment':
      regenerateStartingEquipmentPathForDuplicate(result)
      return
    default: {
      const _exhaustive: never = path
      throw new Error(`Unhandled nested id regeneration path: ${_exhaustive}`)
    }
  }
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
    regenerateNestedPathForDuplicate(result, path, context.destinationSlug)
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
