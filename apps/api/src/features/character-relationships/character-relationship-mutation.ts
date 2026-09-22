import { randomUUID } from 'node:crypto'

import type {
  CharacterRelationshipEdge,
  CreateCharacterRelationshipCommand,
  DeleteCharacterRelationshipInput,
  UpdateCharacterRelationshipInput,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../lib/mongo-transaction'
import type { WithMongoSession } from '../../lib/mongo-session'
import { assertCreateCharacterRelationshipEndpoints } from './lib/assert-relationship-endpoints'
import {
  createCharacterRelationshipRecord,
  deleteCharacterRelationshipRecord,
  findCharacterRelationshipById,
  findCharacterRelationshipIdempotencyRecord,
  hashCharacterRelationshipCreateRequest,
  recordCharacterRelationshipIdempotency,
  updateCharacterRelationshipRecord,
} from './character-relationship.repository'
import { CharacterRelationshipModel } from './character-relationship.model'

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  )
}

async function clearOtherPrimaryResidences(
  input: {
    campaignId: string
    characterId: string
    relationshipId: string
  },
  options?: WithMongoSession,
): Promise<void> {
  await CharacterRelationshipModel.updateMany(
    {
      campaignId: input.campaignId,
      characterId: input.characterId,
      kind: 'resides_at',
      _id: { $ne: input.relationshipId },
      'details.lifecycle': 'current',
      'details.isPrimary': true,
    },
    { $set: { 'details.isPrimary': false } },
    { session: options?.session },
  )
}

export async function createCharacterRelationshipRecordCommand(input: {
  campaignId: string
  actorUserId: string
  command: CreateCharacterRelationshipCommand
}): Promise<CharacterRelationshipEdge> {
  const requestHash = hashCharacterRelationshipCreateRequest({
    campaignId: input.campaignId,
    actorUserId: input.actorUserId,
    relationship: input.command.relationship,
  })

  const existingIdempotency = await findCharacterRelationshipIdempotencyRecord({
    campaignId: input.campaignId,
    actorUserId: input.actorUserId,
    commandType: 'create',
    idempotencyKey: input.command.idempotencyKey,
  })

  if (existingIdempotency) {
    if (existingIdempotency.requestHash !== requestHash) {
      throw HttpError.conflict(
        'Idempotency key was already used for a different relationship request.',
      )
    }

    const relationship = await findCharacterRelationshipById(
      input.campaignId,
      existingIdempotency.relationshipId,
    )
    if (!relationship) {
      throw new HttpError(404, 'not_found', 'Character relationship not found.')
    }
    return relationship
  }

  await assertCreateCharacterRelationshipEndpoints(input.campaignId, input.command.relationship)

  const relationshipId = randomUUID()

  try {
    if (
      input.command.relationship.kind === 'resides_at' &&
      input.command.relationship.details?.isPrimary
    ) {
      if (!areMongoTransactionsEnabled()) {
        throw new HttpError(
          503,
          'transactions_unavailable',
          'Primary residence switching requires MongoDB transactions.',
        )
      }

      return await runInTransaction(async (session) => {
        const relationship = await createCharacterRelationshipRecord(
          {
            id: relationshipId,
            campaignId: input.campaignId,
            createdByUserId: input.actorUserId,
            ...input.command.relationship,
          },
          { session },
        )

        await clearOtherPrimaryResidences(
          {
            campaignId: input.campaignId,
            characterId: relationship.characterId,
            relationshipId: relationship.id,
          },
          { session },
        )

        await recordCharacterRelationshipIdempotency(
          {
            campaignId: input.campaignId,
            actorUserId: input.actorUserId,
            commandType: 'create',
            idempotencyKey: input.command.idempotencyKey,
            requestHash,
            relationshipId: relationship.id,
          },
          { session },
        )

        return relationship
      })
    }

    const relationship = await createCharacterRelationshipRecord({
      id: relationshipId,
      campaignId: input.campaignId,
      createdByUserId: input.actorUserId,
      ...input.command.relationship,
    })

    await recordCharacterRelationshipIdempotency({
      campaignId: input.campaignId,
      actorUserId: input.actorUserId,
      commandType: 'create',
      idempotencyKey: input.command.idempotencyKey,
      requestHash,
      relationshipId: relationship.id,
    })

    return relationship
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw HttpError.conflict('A relationship with the same kind and endpoints already exists.')
    }
    throw error
  }
}

export async function updateCharacterRelationshipRecordCommand(input: {
  campaignId: string
  relationshipId: string
  body: UpdateCharacterRelationshipInput
}): Promise<CharacterRelationshipEdge> {
  const existing = await findCharacterRelationshipById(input.campaignId, input.relationshipId)
  if (!existing) {
    throw new HttpError(404, 'not_found', 'Character relationship not found.')
  }

  const nextIsPrimary =
    existing.kind === 'resides_at' &&
    input.body.details &&
    'isPrimary' in input.body.details &&
    input.body.details.isPrimary === true

  if (nextIsPrimary) {
    if (!areMongoTransactionsEnabled()) {
      throw new HttpError(
        503,
        'transactions_unavailable',
        'Primary residence switching requires MongoDB transactions.',
      )
    }

    return runInTransaction(async (session) => {
      const relationship = await updateCharacterRelationshipRecord(
        {
          campaignId: input.campaignId,
          relationshipId: input.relationshipId,
          expectedRevision: input.body.expectedRevision,
          patch: input.body,
        },
        { session },
      )

      await clearOtherPrimaryResidences(
        {
          campaignId: input.campaignId,
          characterId: relationship.characterId,
          relationshipId: relationship.id,
        },
        { session },
      )

      return relationship
    })
  }

  return updateCharacterRelationshipRecord({
    campaignId: input.campaignId,
    relationshipId: input.relationshipId,
    expectedRevision: input.body.expectedRevision,
    patch: input.body,
  })
}

export async function deleteCharacterRelationshipRecordCommand(input: {
  campaignId: string
  relationshipId: string
  body: DeleteCharacterRelationshipInput
}): Promise<void> {
  await deleteCharacterRelationshipRecord({
    campaignId: input.campaignId,
    relationshipId: input.relationshipId,
    expectedRevision: input.body.expectedRevision,
  })
}
