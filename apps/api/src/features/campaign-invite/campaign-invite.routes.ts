import { Router } from 'express'

import { campaignInviteRecipientInputSchema } from '@rpg/contracts'

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

export const campaignInvitePublicRouter: Router = Router()

campaignInvitePublicRouter.get(
  '/:inviteId/onboarding-context',
  requireAuth,
  controller.getOnboardingContext,
)
campaignInvitePublicRouter.post('/:token/accept', requireAuth, controller.acceptByToken)
campaignInvitePublicRouter.get('/:token', controller.resolveByToken)
