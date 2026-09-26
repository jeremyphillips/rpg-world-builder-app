import { Router } from 'express'

import {
  campaignParticipatingCharacterStatusPatchSchema,
  characterMediaPatchInputSchema,
  createCampaignInputSchema,
  selectCampaignInputSchema,
  updateCampaignInputSchema,
  completeCampaignOnboardingInputSchema,
  CAMPAIGN_ROLES,
} from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import { validate } from '../../middleware/validate'
import * as controller from './campaign.controller'
import * as campaignCharacterController from './campaign-character.controller'
import * as onboardingController from './campaign-onboarding.controller'
import { getSearchCatalog } from '../global-search'
import {
  createCharacterRelationshipItem,
  deleteCharacterRelationshipItem,
  listCharacterRelationships,
  updateCharacterRelationshipItem,
} from '../character-relationships/character-relationship.handlers'

export const campaignRouter: Router = Router()

campaignRouter.get('/', requireAuth, controller.list)
campaignRouter.get('/templates', requireAuth, controller.listTemplates)
campaignRouter.post('/', requireAuth, validate(createCampaignInputSchema), controller.create)
campaignRouter.put(
  '/selection',
  requireAuth,
  validate(selectCampaignInputSchema),
  controller.selectCampaign,
)
campaignRouter.patch(
  '/:campaignId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  validate(updateCampaignInputSchema),
  controller.patch,
)
campaignRouter.get(
  '/:campaignId/members',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.listMembers,
)
campaignRouter.delete(
  '/:campaignId/members/:membershipId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.removeMember,
)
campaignRouter.get(
  '/:campaignId/party',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.listParty,
)
campaignRouter.get(
  '/:campaignId/search/catalog',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  getSearchCatalog,
)
campaignRouter.get(
  '/:campaignId/characters',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  campaignCharacterController.listCampaignCharacters,
)
campaignRouter.get(
  '/:campaignId/characters/:characterId',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  campaignCharacterController.getCampaignCharacter,
)
campaignRouter.patch(
  '/:campaignId/characters/:characterId/media',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  validate(characterMediaPatchInputSchema),
  campaignCharacterController.patchCampaignCharacterMediaHandler,
)
campaignRouter.patch(
  '/:campaignId/characters/:characterId/status',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  validate(campaignParticipatingCharacterStatusPatchSchema),
  campaignCharacterController.patchCampaignCharacterStatusHandler,
)
campaignRouter.get(
  '/:campaignId/characters/:characterId/relationships',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  listCharacterRelationships,
)
campaignRouter.post(
  '/:campaignId/character-relationships',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  createCharacterRelationshipItem,
)
campaignRouter.patch(
  '/:campaignId/character-relationships/:relationshipId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  updateCharacterRelationshipItem,
)
campaignRouter.delete(
  '/:campaignId/character-relationships/:relationshipId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  deleteCharacterRelationshipItem,
)

campaignRouter.get(
  '/:campaignId/onboarding-context',
  requireAuth,
  onboardingController.getOnboardingContext,
)
campaignRouter.get(
  '/:campaignId/onboarding/eligible-characters',
  requireAuth,
  onboardingController.listEligibleCharacters,
)
campaignRouter.post(
  '/:campaignId/onboarding/complete',
  requireAuth,
  validate(completeCampaignOnboardingInputSchema),
  onboardingController.completeOnboarding,
)
