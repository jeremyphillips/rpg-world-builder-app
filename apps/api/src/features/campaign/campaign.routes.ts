import { Router } from 'express'

import {
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
import * as onboardingController from './campaign-onboarding.controller'

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
