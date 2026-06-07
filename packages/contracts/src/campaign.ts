import { z } from 'zod'
import { campaignRoleSchema } from './roles'

// ---------------------------------------------------------------------------
// Campaign identity
// ---------------------------------------------------------------------------

export const campaignIdentitySchema = z.object({
  name: z.string().min(1).max(100),
  // Future: slug, description, imageKey, tags
})

export type CampaignIdentity = z.infer<typeof campaignIdentitySchema>

// ---------------------------------------------------------------------------
// Campaign configuration
// ---------------------------------------------------------------------------

export const campaignConfigurationSchema = z.object({
  // Future: gameSystem, maxPlayers, sessionSchedule, isInviteOnly
})

export type CampaignConfiguration = z.infer<typeof campaignConfigurationSchema>

// ---------------------------------------------------------------------------
// Campaign status
// ---------------------------------------------------------------------------

export const CAMPAIGN_STATUSES = ['draft', 'active', 'archived'] as const

export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES)

export type CampaignStatus = z.infer<typeof campaignStatusSchema>

// ---------------------------------------------------------------------------
// Campaign visibility
// ---------------------------------------------------------------------------

/**
 * Controls whether a campaign appears on the public landing page.
 *
 * - private → invite-only; never listed publicly (default)
 * - public  → listed on the landing page when status is 'active'
 *
 * Future: 'unlisted' — accessible via shareable link but not indexed.
 */
export const CAMPAIGN_VISIBILITY = ['public', 'private'] as const

export const campaignVisibilitySchema = z.enum(CAMPAIGN_VISIBILITY)

export type CampaignVisibility = z.infer<typeof campaignVisibilitySchema>

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------

export const campaignSchema = z.object({
  id: z.string().min(1),
  identity: campaignIdentitySchema,
  configuration: campaignConfigurationSchema,
  status: campaignStatusSchema,
  visibility: campaignVisibilitySchema,
  /** The userId who created this campaign. Immutable — distinct from the current owner, which is transferable. */
  createdBy: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Campaign = z.infer<typeof campaignSchema>

// ---------------------------------------------------------------------------
// Content visibility
// ---------------------------------------------------------------------------

/**
 * Phase 1 visibility flags for campaign content items.
 *
 * - dm-only  → visible to owner + co-owner only
 * - party    → visible to owner, co-owner, and all pc members
 * - public   → visible to everyone in the campaign including observers
 *
 * Named `visibility` (not a boolean flag) so it extends cleanly to the Phase 2
 * ABAC grant model without a breaking schema migration.
 */
export const CONTENT_VISIBILITY = ['dm-only', 'party', 'public'] as const

export const contentVisibilitySchema = z.enum(CONTENT_VISIBILITY)

export type ContentVisibility = z.infer<typeof contentVisibilitySchema>

// ---------------------------------------------------------------------------
// Campaign membership
// ---------------------------------------------------------------------------

/**
 * Represents a user's membership in a specific campaign.
 *
 * Invariants enforced at the service layer (not schema):
 * - Only characters owned by this user may appear in `characterIds`
 * - A character may belong to at most one campaign at a time
 * - The `owner` campaignRole is created when the campaign is created and
 *   cannot be self-removed
 */
export const campaignMembershipSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  userId: z.string().min(1),
  campaignRole: campaignRoleSchema,
  /** IDs of characters this user has submitted to this campaign. */
  characterIds: z.array(z.string()),
  invitedAt: z.iso.datetime(),
  joinedAt: z.iso.datetime().nullable(),
})

export type CampaignMembership = z.infer<typeof campaignMembershipSchema>
