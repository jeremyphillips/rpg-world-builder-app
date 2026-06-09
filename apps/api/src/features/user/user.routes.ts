import { Router } from 'express'

import { changePasswordInputSchema, updateProfileInputSchema } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { validate } from '../../middleware/validate'
import * as controller from './user.controller'

export const userRouter: Router = Router()

userRouter.patch('/me', requireAuth, validate(updateProfileInputSchema), controller.patchProfile)
userRouter.patch(
  '/me/password',
  requireAuth,
  validate(changePasswordInputSchema),
  controller.patchPassword,
)
