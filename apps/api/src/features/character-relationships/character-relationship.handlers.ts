import type { Request, Response } from 'express'

import {
  characterRelationshipsListQuerySchema,
  createCharacterRelationshipCommandSchema,
  deleteCharacterRelationshipInputSchema,
  replaceCharacterRelationshipCommandSchema,
  updateCharacterRelationshipInputSchema,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { authorizeCampaignParticipantAccess } from '../campaign/campaign-character-access.service'
import {
  createCharacterRelationshipRecordCommand,
  deleteCharacterRelationshipRecordCommand,
  replaceCharacterRelationshipRecordCommand,
  updateCharacterRelationshipRecordCommand,
} from './character-relationship-mutation'
import {
  findCharacterRelationshipById,
  findCharacterRelationshipEdgesForCharacter,
} from './character-relationship.repository'
import { canViewerSeeCharacterRelationship } from './lib/character-relationship-visibility.lib'
import { projectCharacterRelationships } from './lib/project-character-relationships'

function routeParams(req: Request): {
  campaignId: string
  characterId?: string
  relationshipId?: string
} {
  return req.params as { campaignId: string; characterId?: string; relationshipId?: string }
}

async function assertManagerRelationshipWriteAccess(req: Request, characterId: string) {
  const { campaignId } = routeParams(req)
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  if (membership.campaignRole !== 'owner' && membership.campaignRole !== 'co-owner') {
    throw HttpError.forbidden('You do not have permission to edit character relationships.')
  }

  const access = await authorizeCampaignParticipantAccess({
    campaignId,
    characterId,
    viewerUserId: req.user!.id,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
  })

  if (!access.ok) {
    throw access.error
  }

  return { campaignId, characterId }
}

export async function listCharacterRelationships(req: Request, res: Response): Promise<void> {
  const { campaignId, characterId } = routeParams(req)
  const membership = req.campaignMembership
  if (!membership || !characterId) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const query = characterRelationshipsListQuerySchema.parse(req.query)
  const access = await authorizeCampaignParticipantAccess({
    campaignId,
    characterId,
    viewerUserId: req.user!.id,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
  })

  if (!access.ok) {
    throw access.error
  }

  const edges = findCharacterRelationshipEdgesForCharacter({
    campaignId,
    characterId,
    kinds: query.kinds,
  })

  const viewerContext = {
    viewerRole: membership.campaignRole,
    viewerCharacterIds: membership.pcCharacterIds,
    viewerCharacterId: characterId,
  }

  const visibleEdges = (await edges).filter((relationship) =>
    canViewerSeeCharacterRelationship(relationship, viewerContext),
  )

  const total = visibleEdges.length
  const startIndex = query.cursor ? visibleEdges.findIndex((edge) => edge.id > query.cursor!) : 0
  const pageStart = startIndex === -1 ? visibleEdges.length : startIndex
  const pageEdges = visibleEdges.slice(pageStart, pageStart + query.limit)

  const items = await projectCharacterRelationships(pageEdges, viewerContext)

  res.status(200).json({
    items,
    total,
  })
}

export async function createCharacterRelationshipItem(req: Request, res: Response): Promise<void> {
  const body = createCharacterRelationshipCommandSchema.parse(req.body)
  await assertManagerRelationshipWriteAccess(req, body.relationship.characterId)

  const relationship = await createCharacterRelationshipRecordCommand({
    campaignId: routeParams(req).campaignId,
    actorUserId: req.user!.id,
    command: body,
  })

  res.status(201).json({ relationship })
}

export async function updateCharacterRelationshipItem(req: Request, res: Response): Promise<void> {
  const { campaignId, relationshipId } = routeParams(req)
  if (!relationshipId) {
    throw HttpError.badRequest('Relationship id is required.')
  }

  const body = updateCharacterRelationshipInputSchema.parse(req.body)
  const existing = await findCharacterRelationshipById(campaignId, relationshipId)
  if (!existing) {
    throw new HttpError(404, 'not_found', 'Character relationship not found.')
  }

  await assertManagerRelationshipWriteAccess(req, existing.characterId)

  const relationship = await updateCharacterRelationshipRecordCommand({
    campaignId,
    relationshipId,
    body,
  })

  res.status(200).json({ relationship })
}

export async function deleteCharacterRelationshipItem(req: Request, res: Response): Promise<void> {
  const { campaignId, relationshipId } = routeParams(req)
  if (!relationshipId) {
    throw HttpError.badRequest('Relationship id is required.')
  }

  const body = deleteCharacterRelationshipInputSchema.parse(req.body)
  const existing = await findCharacterRelationshipById(campaignId, relationshipId)
  if (!existing) {
    throw new HttpError(404, 'not_found', 'Character relationship not found.')
  }

  await assertManagerRelationshipWriteAccess(req, existing.characterId)
  await deleteCharacterRelationshipRecordCommand({
    campaignId,
    relationshipId,
    body,
  })

  res.status(200).json({ ok: true })
}

export async function replaceCharacterRelationshipItem(req: Request, res: Response): Promise<void> {
  const { campaignId, relationshipId } = routeParams(req)
  if (!relationshipId) {
    throw HttpError.badRequest('Relationship id is required.')
  }

  const body = replaceCharacterRelationshipCommandSchema.parse(req.body)
  if (body.relationshipId !== relationshipId) {
    throw HttpError.badRequest('Relationship id in the body must match the route.')
  }

  const existing = await findCharacterRelationshipById(campaignId, relationshipId)
  if (!existing) {
    throw new HttpError(404, 'not_found', 'Character relationship not found.')
  }

  await assertManagerRelationshipWriteAccess(req, existing.characterId)

  const relationship = await replaceCharacterRelationshipRecordCommand({
    campaignId,
    actorUserId: req.user!.id,
    relationshipId,
    expectedRevision: body.expectedRevision,
    command: body,
  })

  res.status(200).json({ relationship })
}
