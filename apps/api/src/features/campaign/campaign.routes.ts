import { Router } from 'express'

import {
  createCampaignInputSchema,
  selectCampaignInputSchema,
  updateCampaignInputSchema,
} from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
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
campaignRouter.patch(
  '/:campaignId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  validate(updateCampaignInputSchema),
  controller.patch,
)
