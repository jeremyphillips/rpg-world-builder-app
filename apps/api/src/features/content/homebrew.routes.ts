import { Router } from 'express'

import { CAMPAIGN_ROLES } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import * as controller from './content.controller'

export const homebrewRouter: Router = Router({ mergeParams: true })

homebrewRouter.get(
  '/summary',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.getHomebrewSummary,
)
