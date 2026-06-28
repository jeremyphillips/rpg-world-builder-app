import { Router } from 'express'

import { CAMPAIGN_ROLES, updateCampaignCharacterCreationInputSchema } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import { validate } from '../../middleware/validate'
import * as controller from './ruleset-patch.controller'

export const rulesetPatchRouter: Router = Router({ mergeParams: true })

rulesetPatchRouter.get(
  '/',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.getRulesetPatch,
)

rulesetPatchRouter.patch(
  '/character-creation',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  validate(updateCampaignCharacterCreationInputSchema),
  controller.patchCharacterCreation,
)
