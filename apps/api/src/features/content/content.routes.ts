import { Router } from 'express'

import { CAMPAIGN_ROLES } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import * as controller from './content.controller'

// `mergeParams` so the `:campaignId` from the mount path reaches the membership
// guard and handlers. Mounted at `/api/campaigns/:campaignId/content`.
export const contentRouter: Router = Router({ mergeParams: true })

// Any campaign member may read the resolved catalog (characters consume it).
contentRouter.get(
  '/classes',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.listClasses,
)

contentRouter.get(
  '/classes/:classId/subclasses',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.listSubclasses,
)

contentRouter.get(
  '/skill-proficiencies',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.listSkillProficiencies,
)
