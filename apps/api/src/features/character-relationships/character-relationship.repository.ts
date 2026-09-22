import { createHash } from 'node:crypto'

import type {
  CharacterRelationshipEdge,
  CharacterRelationshipEdgeKind,
  CreateCharacterRelationshipInput,
  UpdateCharacterRelationshipInput,
} from '@rpg/contracts'
import {
  buildCharacterRelationshipCanonicalKey,
  canonicalizeCharacterRelationshipEndpoints,
  characterRelationshipEdgeSchema,
  DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import type { WithMongoSession } from '../../lib/mongo-session'
import { CharacterRelationshipIdempotencyModel } from './character-relationship-idempotency.model'
import {
  CharacterRelationshipModel,
  type CharacterRelationshipDoc,
} from './character-relationship.model'

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

export function toCharacterRelationshipEdge(
  doc: CharacterRelationshipDoc,
): CharacterRelationshipEdge {
  return characterRelationshipEdgeSchema.parse({
    id: doc._id,
    campaignId: doc.campaignId,
    revision: doc.revision,
    createdAt: toIsoString(doc.createdAt),
    updatedAt: toIsoString(doc.updatedAt),
    createdByUserId: doc.createdByUserId,
    visibility: doc.visibility,
    kind: doc.kind,
    characterId: doc.characterId,
    organizationId: doc.organizationId ?? undefined,
    locationId: doc.locationId ?? undefined,
    relatedCharacterId: doc.relatedCharacterId ?? undefined,
    details: doc.details ?? {},
  })
}

function buildRelationshipDocFields(
  input: CreateCharacterRelationshipInput & {
    id: string
    campaignId: string
    createdByUserId: string
  },
) {
  const endpoints = canonicalizeCharacterRelationshipEndpoints(input)
  const canonicalEndpointsKey = buildCharacterRelationshipCanonicalKey({
    kind: input.kind,
    characterId: endpoints.characterId,
    organizationId: endpoints.organizationId,
    locationId: endpoints.locationId,
    relatedCharacterId: endpoints.relatedCharacterId,
  })

  return {
    _id: input.id,
    campaignId: input.campaignId,
    revision: 1,
    kind: input.kind,
    characterId: endpoints.characterId,
    organizationId: endpoints.organizationId,
    locationId: endpoints.locationId,
    relatedCharacterId: endpoints.relatedCharacterId,
    canonicalEndpointsKey,
    details: input.details ?? {},
    visibility: input.visibility ?? DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY,
    createdByUserId: input.createdByUserId,
  }
}

export function hashCharacterRelationshipCreateRequest(input: {
  campaignId: string
  actorUserId: string
  relationship: CreateCharacterRelationshipInput
}): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        campaignId: input.campaignId,
        actorUserId: input.actorUserId,
        relationship: input.relationship,
      }),
    )
    .digest('hex')
}

export async function findCharacterRelationshipIdempotencyRecord(
  input: {
    campaignId: string
    actorUserId: string
    commandType: 'create'
    idempotencyKey: string
  },
  options?: WithMongoSession,
) {
  return CharacterRelationshipIdempotencyModel.findOne(input)
    .select('requestHash relationshipId')
    .lean<{ requestHash: string; relationshipId: string } | null>()
    .session(options?.session ?? null)
}

export async function recordCharacterRelationshipIdempotency(
  input: {
    campaignId: string
    actorUserId: string
    commandType: 'create'
    idempotencyKey: string
    requestHash: string
    relationshipId: string
  },
  options?: WithMongoSession,
): Promise<void> {
  try {
    await CharacterRelationshipIdempotencyModel.create([input], { session: options?.session })
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error
    }
  }
}

export async function findCharacterRelationshipById(
  campaignId: string,
  relationshipId: string,
  options?: WithMongoSession,
): Promise<CharacterRelationshipEdge | null> {
  const doc = await CharacterRelationshipModel.findOne({ _id: relationshipId, campaignId })
    .lean<CharacterRelationshipDoc | null>()
    .session(options?.session ?? null)

  return doc ? toCharacterRelationshipEdge(doc) : null
}

export async function findCharacterRelationshipByCanonicalKey(
  input: {
    campaignId: string
    kind: CharacterRelationshipEdgeKind
    characterId: string
    organizationId?: string
    locationId?: string
    relatedCharacterId?: string
  },
  options?: WithMongoSession,
): Promise<CharacterRelationshipEdge | null> {
  const canonicalEndpointsKey = buildCharacterRelationshipCanonicalKey(input)
  const doc = await CharacterRelationshipModel.findOne({
    campaignId: input.campaignId,
    kind: input.kind,
    canonicalEndpointsKey,
  })
    .lean<CharacterRelationshipDoc | null>()
    .session(options?.session ?? null)

  return doc ? toCharacterRelationshipEdge(doc) : null
}

export async function createCharacterRelationshipRecord(
  input: CreateCharacterRelationshipInput & {
    id: string
    campaignId: string
    createdByUserId: string
  },
  options?: WithMongoSession,
): Promise<CharacterRelationshipEdge> {
  const doc = buildRelationshipDocFields(input)
  const existing = await findCharacterRelationshipByCanonicalKey(
    {
      campaignId: input.campaignId,
      kind: input.kind,
      characterId: doc.characterId,
      organizationId: doc.organizationId,
      locationId: doc.locationId,
      relatedCharacterId: doc.relatedCharacterId,
    },
    options,
  )

  if (existing) {
    throw new HttpError(
      409,
      'conflict',
      'A relationship with the same kind and endpoints already exists.',
    )
  }

  const created = await CharacterRelationshipModel.create([doc], { session: options?.session })
  return toCharacterRelationshipEdge(created[0]!.toObject() as CharacterRelationshipDoc)
}

function raiseStaleRelationshipRevision(doc: CharacterRelationshipDoc): never {
  throw new HttpError(409, 'stale_revision', 'Character relationship revision is stale.', {
    relationship: toCharacterRelationshipEdge(doc),
  })
}

async function loadRelationshipDoc(
  campaignId: string,
  relationshipId: string,
  options?: WithMongoSession,
): Promise<CharacterRelationshipDoc | null> {
  return CharacterRelationshipModel.findOne({ _id: relationshipId, campaignId })
    .lean<CharacterRelationshipDoc | null>()
    .session(options?.session ?? null)
}

export async function updateCharacterRelationshipRecord(
  input: {
    campaignId: string
    relationshipId: string
    expectedRevision: number
    patch: UpdateCharacterRelationshipInput
  },
  options?: WithMongoSession,
): Promise<CharacterRelationshipEdge> {
  const existing = await loadRelationshipDoc(input.campaignId, input.relationshipId, options)
  if (!existing) {
    throw new HttpError(404, 'not_found', 'Character relationship not found.')
  }

  if (existing.revision !== input.expectedRevision) {
    raiseStaleRelationshipRevision(existing)
  }

  const setFields: Record<string, unknown> = {
    details: mergeRelationshipDetails(existing.details, input.patch.details),
  }
  if (input.patch.visibility !== undefined) {
    setFields.visibility = input.patch.visibility
  }

  const result = await CharacterRelationshipModel.updateOne(
    {
      _id: input.relationshipId,
      campaignId: input.campaignId,
      revision: input.expectedRevision,
    },
    { $set: setFields, $inc: { revision: 1 } },
    { session: options?.session },
  )

  if (result.matchedCount === 1) {
    const updated = await loadRelationshipDoc(input.campaignId, input.relationshipId, options)
    if (!updated) {
      throw new HttpError(404, 'not_found', 'Character relationship not found.')
    }
    return toCharacterRelationshipEdge(updated)
  }

  const current = await loadRelationshipDoc(input.campaignId, input.relationshipId, options)
  if (!current) {
    throw new HttpError(404, 'not_found', 'Character relationship not found.')
  }

  raiseStaleRelationshipRevision(current)
}

export async function deleteCharacterRelationshipRecord(
  input: {
    campaignId: string
    relationshipId: string
    expectedRevision: number
  },
  options?: WithMongoSession,
): Promise<void> {
  const result = await CharacterRelationshipModel.deleteOne({
    _id: input.relationshipId,
    campaignId: input.campaignId,
    revision: input.expectedRevision,
  }).session(options?.session ?? null)

  if (result.deletedCount === 1) {
    return
  }

  const exists = await CharacterRelationshipModel.exists({
    _id: input.relationshipId,
    campaignId: input.campaignId,
  }).session(options?.session ?? null)

  if (!exists) {
    throw new HttpError(404, 'not_found', 'Character relationship not found.')
  }

  const current = await CharacterRelationshipModel.findOne({
    _id: input.relationshipId,
    campaignId: input.campaignId,
  }).lean<CharacterRelationshipDoc | null>()

  throw new HttpError(409, 'stale_revision', 'Character relationship revision is stale.', {
    relationship: current ? toCharacterRelationshipEdge(current) : undefined,
  })
}

export async function listCharacterRelationshipsForCharacter(
  input: {
    campaignId: string
    characterId: string
    kinds?: readonly CharacterRelationshipEdgeKind[]
    cursor?: string
    limit: number
  },
  options?: WithMongoSession,
): Promise<{ items: CharacterRelationshipEdge[]; total: number }> {
  const endpointFilter = {
    campaignId: input.campaignId,
    $or: [{ characterId: input.characterId }, { relatedCharacterId: input.characterId }],
    ...(input.kinds ? { kind: { $in: input.kinds } } : {}),
    ...(input.cursor ? { _id: { $gt: input.cursor } } : {}),
  }

  const [docs, total] = await Promise.all([
    CharacterRelationshipModel.find(endpointFilter)
      .sort({ _id: 1 })
      .limit(input.limit)
      .lean<CharacterRelationshipDoc[]>()
      .session(options?.session ?? null),
    CharacterRelationshipModel.countDocuments({
      campaignId: input.campaignId,
      $or: [{ characterId: input.characterId }, { relatedCharacterId: input.characterId }],
      ...(input.kinds ? { kind: { $in: input.kinds } } : {}),
    }).session(options?.session ?? null),
  ])

  return {
    items: docs.map(toCharacterRelationshipEdge),
    total,
  }
}

export async function deleteCharacterRelationshipsForCampaign(
  campaignId: string,
  options?: WithMongoSession,
): Promise<void> {
  await CharacterRelationshipModel.deleteMany({ campaignId }).session(options?.session ?? null)
  await CharacterRelationshipIdempotencyModel.deleteMany({ campaignId }).session(
    options?.session ?? null,
  )
}

function mergeRelationshipDetails(
  existing: unknown,
  patch?: Record<string, unknown>,
): Record<string, unknown> {
  const current =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {}

  if (!patch) {
    return current
  }

  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      delete current[key]
    } else if (value !== undefined) {
      current[key] = value
    }
  }

  return current
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  )
}
