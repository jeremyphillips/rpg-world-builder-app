import { Router } from 'express'

import { createCampaignInputSchema, selectCampaignInputSchema } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { validate } from '../../middleware/validate'
import * as controller from './campaign.controller'

export const campaignRouter: Router = Router()

campaignRouter.get('/', requireAuth, controller.list)
campaignRouter.post('/', requireAuth, validate(createCampaignInputSchema), controller.create)
campaignRouter.put(
  '/selection',
  requireAuth,
  validate(selectCampaignInputSchema),
  controller.selectCampaign,
)
