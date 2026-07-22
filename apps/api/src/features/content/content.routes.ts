import { Router } from 'express'

import { CAMPAIGN_ROLES } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import * as controller from './content.controller'

// `mergeParams` so the `:campaignId` from the mount path reaches the membership
// guard and handlers. Mounted at `/api/campaigns/:campaignId/content`.
export const contentRouter: Router = Router({ mergeParams: true })

// Bespoke nested read — catalog seed subclasses (Phase 8 may extend with homebrew).
contentRouter.get(
  '/classes/:classId/subclasses',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.listSubclasses,
)

// Any campaign member may read the resolved catalog (characters consume it).
contentRouter.get(
  '/:contentType',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.listContent,
)

// Authoring — owner/co-owner only. Body validation happens in the write service
// per content type so each route can use its contract DTO schema.
contentRouter.post(
  '/:contentType',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.createContentItem,
)

contentRouter.patch(
  '/:contentType/:entityId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.updateContentItem,
)

contentRouter.get(
  '/:contentType/:entityId/deletion-availability',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.getContentDeletionAvailabilityHandler,
)

contentRouter.delete(
  '/:contentType/:entityId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.deleteContentItem,
)
