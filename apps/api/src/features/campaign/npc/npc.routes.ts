import { Router } from 'express'

import { CAMPAIGN_ROLES, createNpcRequestInputSchema } from '@rpg/contracts'

import { requireAuth } from '../../../middleware/require-auth'
import { requireCampaignRole } from '../../../middleware/require-role'
import { validate } from '../../../middleware/validate'
import * as controller from './npc.controller'
import { rejectNpcServerAssignedFields } from './assert-npc-create'

export const campaignNpcRouter: Router = Router({ mergeParams: true })

const requireNpcAuthor = requireCampaignRole('owner', 'co-owner')
const requireCampaignMember = requireCampaignRole(...CAMPAIGN_ROLES)

campaignNpcRouter.get('/', requireAuth, requireCampaignMember, controller.list)
campaignNpcRouter.post(
  '/',
  requireAuth,
  requireNpcAuthor,
  rejectNpcServerAssignedFields,
  validate(createNpcRequestInputSchema),
  controller.create,
)
campaignNpcRouter.get('/:npcId', requireAuth, requireCampaignMember, controller.getById)
campaignNpcRouter.delete('/:npcId', requireAuth, requireNpcAuthor, controller.remove)
