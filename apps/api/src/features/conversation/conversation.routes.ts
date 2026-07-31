import { Router } from 'express'

import { requireAuth } from '../../middleware/require-auth'
import { validate } from '../../middleware/validate'
import {
  createDirectConversationInputSchema,
  markConversationReadInputSchema,
  sendDirectMessageInputSchema,
} from '@rpg/contracts'

import * as controller from './conversation.controller'

export const conversationRouter: Router = Router()

conversationRouter.get('/direct/recipients', requireAuth, controller.listRecipients)
conversationRouter.post(
  '/direct',
  requireAuth,
  validate(createDirectConversationInputSchema),
  controller.createDirect,
)
conversationRouter.get('/', requireAuth, controller.list)
conversationRouter.get('/:conversationId/messages', requireAuth, controller.listMessages)
conversationRouter.post(
  '/:conversationId/messages',
  requireAuth,
  validate(sendDirectMessageInputSchema),
  controller.sendMessage,
)
conversationRouter.patch(
  '/:conversationId/read',
  requireAuth,
  validate(markConversationReadInputSchema),
  controller.markRead,
)
