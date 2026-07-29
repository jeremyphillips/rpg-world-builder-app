import { Router } from 'express'

import { createCharacterInputSchema } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { validate } from '../../middleware/validate'
import * as controller from './character.controller'
import { rejectServerAssignedCharacterFields } from './reject-server-assigned-character-fields'

export const characterRouter: Router = Router()

characterRouter.get('/', requireAuth, controller.list)
characterRouter.post(
  '/',
  requireAuth,
  rejectServerAssignedCharacterFields,
  validate(createCharacterInputSchema),
  controller.create,
)
characterRouter.get('/:characterId/routing-context', requireAuth, controller.getRoutingContext)
characterRouter.get('/:characterId', requireAuth, controller.getById)
characterRouter.delete('/:characterId', requireAuth, controller.remove)
