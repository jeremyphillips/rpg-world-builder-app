import { Router } from 'express'

import { CAMPAIGN_ROLES } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import * as controller from './content.controller'
import * as subclassController from './subclasses/subclass-write.handlers'

// `mergeParams` so the `:campaignId` from the mount path reaches the membership
// guard and handlers. Mounted at `/api/campaigns/:campaignId/content`.
export const contentRouter: Router = Router({ mergeParams: true })

// Nested subclass routes — register before `/:contentType`.
contentRouter.get(
  '/classes/:classId/subclasses',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  subclassController.listSubclasses,
)

contentRouter.post(
  '/classes/:classId/subclasses',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  subclassController.createSubclassItem,
)

contentRouter.patch(
  '/classes/:classId/subclasses/:subclassId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  subclassController.updateSubclassItem,
)

contentRouter.get(
  '/classes/:classId/subclasses/:subclassId/campaign-access-availability',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  subclassController.getSubclassCampaignAccessAvailabilityHandler,
)

contentRouter.patch(
  '/classes/:classId/subclasses/:subclassId/campaign-access',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  subclassController.updateSubclassCampaignAccessHandler,
)

contentRouter.get(
  '/classes/:classId/subclasses/:subclassId/deletion-availability',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  subclassController.getSubclassDeletionAvailabilityHandler,
)

contentRouter.delete(
  '/classes/:classId/subclasses/:subclassId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  subclassController.deleteSubclassItem,
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

contentRouter.post(
  '/:contentType/:entityId/duplicate',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.duplicateContentItem,
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

contentRouter.post(
  '/:contentType/:entityId/publish',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.publishContentItem,
)

contentRouter.get(
  '/:contentType/:entityId/demotion-availability',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.getContentDemotionAvailabilityHandler,
)

contentRouter.post(
  '/:contentType/:entityId/demote',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.demoteContentItem,
)

contentRouter.get(
  '/:contentType/:entityId/campaign-access-availability',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.getContentCampaignAccessAvailabilityHandler,
)

contentRouter.patch(
  '/:contentType/:entityId/campaign-access',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.updateContentCampaignAccessHandler,
)
