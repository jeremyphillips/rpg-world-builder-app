import { Router } from 'express'

import { requireAuth } from '../../middleware/require-auth'
import * as controller from './ruleset.controller'

export const rulesetRouter: Router = Router()

rulesetRouter.get(
  '/:rulesetId/character-creation-rules',
  requireAuth,
  controller.getCharacterCreationRules,
)
rulesetRouter.get('/:rulesetId/content/:contentType', requireAuth, controller.listContent)
