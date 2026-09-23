import { Router } from 'express'

import { CAMPAIGN_ROLES } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import {
  createCharacterRelationshipItem,
  deleteCharacterRelationshipItem,
  listCharacterRelationships,
  replaceCharacterRelationshipItem,
  updateCharacterRelationshipItem,
} from './character-relationship.handlers'

// Mounted at `/api/campaigns/:campaignId` when enabled at cutover.
export const characterRelationshipsRouter: Router = Router({ mergeParams: true })

characterRelationshipsRouter.get(
  '/characters/:characterId/relationships',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  listCharacterRelationships,
)

characterRelationshipsRouter.post(
  '/character-relationships',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  createCharacterRelationshipItem,
)

characterRelationshipsRouter.patch(
  '/character-relationships/:relationshipId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  updateCharacterRelationshipItem,
)

characterRelationshipsRouter.post(
  '/character-relationships/:relationshipId/replace',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  replaceCharacterRelationshipItem,
)

characterRelationshipsRouter.delete(
  '/character-relationships/:relationshipId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  deleteCharacterRelationshipItem,
)
