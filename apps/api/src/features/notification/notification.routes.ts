import { Router } from 'express'

import { markNotificationsSeenInputSchema } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { validate } from '../../middleware/validate'
import * as controller from './notification.controller'

export const notificationRouter: Router = Router()

notificationRouter.get('/', requireAuth, controller.list)
notificationRouter.get('/unread-count', requireAuth, controller.unreadCount)
notificationRouter.patch('/:notificationId/read', requireAuth, controller.markRead)
notificationRouter.post('/mark-all-read', requireAuth, controller.markAllRead)
notificationRouter.post(
  '/mark-seen',
  requireAuth,
  validate(markNotificationsSeenInputSchema),
  controller.markSeen,
)
