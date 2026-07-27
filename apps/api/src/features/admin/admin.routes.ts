import { Router } from 'express'

import { requireAuth } from '../../middleware/require-auth'
import { requirePlatformRole } from '../../middleware/require-role'
import * as controller from './admin.controller'

export const adminRouter: Router = Router()

adminRouter.get(
  '/users',
  requireAuth,
  requirePlatformRole('admin', 'superadmin'),
  controller.listUsers,
)

adminRouter.get(
  '/users/:userId/deletion-preview',
  requireAuth,
  requirePlatformRole('superadmin'),
  controller.deletionPreview,
)

adminRouter.delete(
  '/users/:userId',
  requireAuth,
  requirePlatformRole('superadmin'),
  controller.removeUser,
)
