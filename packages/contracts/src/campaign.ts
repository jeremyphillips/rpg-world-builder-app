import { z } from 'zod'
import { campaignRoleSchema } from './roles'

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
