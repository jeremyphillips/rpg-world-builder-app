import { Router } from 'express'

import { createNpcRequestInputSchema } from '@rpg/contracts'

import { requireAuth } from '../../../middleware/require-auth'
import { requireCampaignRole } from '../../../middleware/require-role'
import { validate } from '../../../middleware/validate'
import * as controller from './npc.controller'
import { rejectNpcServerAssignedFields } from './assert-npc-create'

export const campaignNpcRouter: Router = Router({ mergeParams: true })

const requireNpcAuthor = requireCampaignRole('owner', 'co-owner')

campaignNpcRouter.get('/', requireAuth, requireNpcAuthor, controller.list)
campaignNpcRouter.post(
  '/',
  requireAuth,
  requireNpcAuthor,
  rejectNpcServerAssignedFields,
  validate(createNpcRequestInputSchema),
  controller.create,
)
campaignNpcRouter.get('/:npcId', requireAuth, requireNpcAuthor, controller.getById)
campaignNpcRouter.delete('/:npcId', requireAuth, requireNpcAuthor, controller.remove)
