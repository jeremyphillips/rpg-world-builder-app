import { Router } from 'express'

import { CAMPAIGN_ROLES, contentCampaignAccessAvailabilityBatchRequestSchema } from '@rpg/contracts'

import { requireAuth } from '../../middleware/require-auth'
import { requireCampaignRole } from '../../middleware/require-role'
import { validate } from '../../middleware/validate'
import * as controller from './content.controller'
import * as subclassController from './subclasses/subclass-write.handlers'
import * as characterLocationConnectionController from './characters/character-location-connection.handlers'
import * as organizationLocationConnectionController from './organizations/organization-location-connection.handlers'
import { listClasses } from './classes/list-classes'
import { listCharacterOrganizationReferences } from './organizations/organization-reference.controller'
import { listCharacterLocationReferences } from './locations/location-reference.controller'
import { listOrganizationLocationReferences } from './locations/organization-location-reference.controller'
import { listLocationConnectedParties } from './locations/location-connected-parties.controller'
import { listOrganizationConnectedCharacters } from './organizations/organization-connected-characters.controller'
import { listCampaignOrganizationLocationConnectionEdges } from './organizations/list-campaign-organization-location-connection-edges.controller'

// `mergeParams` so the `:campaignId` from the mount path reaches the membership
// guard and handlers. Mounted at `/api/campaigns/:campaignId/content`.
export const contentRouter: Router = Router({ mergeParams: true })

// Nested subclass routes — register before `/:contentType`.
contentRouter.get(
  '/access-participants',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.getCampaignAccessParticipants,
)

contentRouter.get(
  '/classes/:classId/subclasses',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  subclassController.listSubclasses,
)

contentRouter.get(
  '/organizations/references/:characterId',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  listCharacterOrganizationReferences,
)

contentRouter.get(
  '/locations/references/:characterId',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  listCharacterLocationReferences,
)

contentRouter.post(
  '/characters/:characterId/location-connections',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  characterLocationConnectionController.createCharacterLocationConnectionItem,
)

contentRouter.patch(
  '/characters/:characterId/location-connections/:connectionId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  characterLocationConnectionController.updateCharacterLocationConnectionItem,
)

contentRouter.delete(
  '/characters/:characterId/location-connections/:connectionId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  characterLocationConnectionController.deleteCharacterLocationConnectionItem,
)

contentRouter.post(
  '/organizations/:organizationId/location-connections',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  organizationLocationConnectionController.createOrganizationLocationConnectionItem,
)

contentRouter.patch(
  '/organizations/:organizationId/location-connections/:connectionId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  organizationLocationConnectionController.updateOrganizationLocationConnectionItem,
)

contentRouter.delete(
  '/organizations/:organizationId/location-connections/:connectionId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  organizationLocationConnectionController.deleteOrganizationLocationConnectionItem,
)

contentRouter.get(
  '/organizations/:organizationId/location-references',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  listOrganizationLocationReferences,
)

contentRouter.get(
  '/organization-location-connection-edges',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  listCampaignOrganizationLocationConnectionEdges,
)

contentRouter.get(
  '/locations/:locationId/connected-parties',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  listLocationConnectedParties,
)

contentRouter.get(
  '/organizations/:organizationId/connected-characters',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  listOrganizationConnectedCharacters,
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

contentRouter.post(
  '/classes/:classId/subclasses/campaign-access-availability/batch',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  validate(contentCampaignAccessAvailabilityBatchRequestSchema),
  subclassController.batchGetSubclassCampaignAccessAvailabilityHandler,
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

contentRouter.get(
  '/classes/:classId/subclasses/:subclassId/usage',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  subclassController.getSubclassUsageHandler,
)

contentRouter.delete(
  '/classes/:classId/subclasses/:subclassId',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  subclassController.deleteSubclassItem,
)

// Any campaign member may read the resolved catalog (characters consume it).
contentRouter.get('/classes', requireAuth, requireCampaignRole(...CAMPAIGN_ROLES), listClasses)

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

contentRouter.get(
  '/:contentType/:entityId/usage',
  requireAuth,
  requireCampaignRole(...CAMPAIGN_ROLES),
  controller.getContentUsageHandler,
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

contentRouter.post(
  '/:contentType/campaign-access-availability/batch',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  validate(contentCampaignAccessAvailabilityBatchRequestSchema),
  controller.batchGetContentCampaignAccessAvailabilityHandler,
)

contentRouter.patch(
  '/:contentType/:entityId/campaign-access',
  requireAuth,
  requireCampaignRole('owner', 'co-owner'),
  controller.updateContentCampaignAccessHandler,
)
