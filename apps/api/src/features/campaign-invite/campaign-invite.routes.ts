import { Router } from 'express'

import {
  campaignInviteRecipientInputSchema,
  completeCampaignWithExistingCharacterInputSchema,
  completeCampaignWithNewCharacterInputSchema,
} from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import { validate } from '../../middleware/validate'
import * as controller from './campaign-invite.controller'

export const campaignInviteCampaignRouter: Router = Router({ mergeParams: true })

const requireInviteManager = requireCampaignRole('owner', 'co-owner')

campaignInviteCampaignRouter.post(
  '/',
  requireAuth,
  requireInviteManager,
  validate(campaignInviteRecipientInputSchema),
  controller.send,
)
campaignInviteCampaignRouter.get('/', requireAuth, requireInviteManager, controller.list)
campaignInviteCampaignRouter.post(
  '/:inviteId/share-link',
  requireAuth,
  requireInviteManager,
  controller.shareLink,
)
campaignInviteCampaignRouter.post(
  '/:inviteId/revoke',
  requireAuth,
  requireInviteManager,
  controller.revoke,
)

export const campaignInvitePublicRouter: Router = Router()

campaignInvitePublicRouter.get(
  '/:inviteId/onboarding-context',
  requireAuth,
  controller.getOnboardingContext,
)
campaignInvitePublicRouter.get(
  '/:inviteId/eligible-characters',
  requireAuth,
  controller.listEligibleCharacters,
)
campaignInvitePublicRouter.post(
  '/:inviteId/complete-with-existing-character',
  requireAuth,
  validate(completeCampaignWithExistingCharacterInputSchema),
  controller.completeWithExistingCharacter,
)
campaignInvitePublicRouter.post(
  '/:inviteId/complete-with-new-character',
  requireAuth,
  validate(completeCampaignWithNewCharacterInputSchema),
  controller.completeWithNewCharacter,
)
campaignInvitePublicRouter.post('/:token/accept', requireAuth, controller.acceptByToken)
campaignInvitePublicRouter.get('/:token', controller.resolveByToken)
