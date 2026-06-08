import { Router } from 'express'

import { createCampaignInputSchema } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { validate } from '../../middleware/validate'
import * as controller from './campaign.controller'

export const campaignRouter: Router = Router()

campaignRouter.post('/', requireAuth, validate(createCampaignInputSchema), controller.create)
