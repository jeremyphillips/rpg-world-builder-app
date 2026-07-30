import { Router } from 'express'

import { CAMPAIGN_ROLES } from '@rpg/contracts'

import { requireAuth } from '../../../middleware/require-auth'
import { requireCampaignRole } from '../../../middleware/require-role'
import * as controller from './vocabulary.controller'

export const vocabularyRouter: Router = Router({ mergeParams: true })

vocabularyRouter.get(
  '/',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.listVocabularySets,
)

vocabularyRouter.get(
  '/:setId',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.getVocabularySet,
)

vocabularyRouter.post(
  '/:setId/entries',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.createVocabularyEntry,
)

vocabularyRouter.patch(
  '/:setId/entries/:entryId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.patchVocabularyEntry,
)

vocabularyRouter.get(
  '/:setId/entries/:entryId/disable-availability',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.getVocabularyDisableAvailabilityHandler,
)

vocabularyRouter.get(
  '/:setId/entries/:entryId/usage',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.getVocabularyEntryUsageHandler,
)

vocabularyRouter.get(
  '/:setId/entries/:entryId/delete-availability',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.getVocabularyDeleteAvailabilityHandler,
)

vocabularyRouter.delete(
  '/:setId/entries/:entryId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.removeVocabularyEntry,
)
