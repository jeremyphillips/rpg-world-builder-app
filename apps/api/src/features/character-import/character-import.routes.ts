import { Router } from 'express'

import { dndBeyondPreviewInputSchema } from '@rpg/contracts/character-import'

import { requireAuth } from '../../middleware/require-auth'
import { validate } from '../../middleware/validate'
import * as controller from './character-import.controller'

export const characterImportRouter: Router = Router()

characterImportRouter.post(
  '/dnd-beyond/preview',
  requireAuth,
  validate(dndBeyondPreviewInputSchema),
  controller.preview,
)
