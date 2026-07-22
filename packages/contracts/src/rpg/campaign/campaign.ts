import { z } from 'zod'
import { campaignRoleSchema } from '../../shared/roles'
import { systemRulesetIdSchema } from '../primitives/ruleset'
import { versionedTemplateReferenceSchema } from '../primitives/versioned-template'
import { updateCampaignCharacterCreationInputSchema } from './patches/campaign-character-creation-patch'

export {
  EXTENDED_PROGRESSION_TIER_NAME_MAX,
  extendedProgressionSchema,
  type ExtendedProgression,
  IMPORTED_CHARACTERS_POLICIES,
  importedCharactersPolicySchema,
  type ImportedCharactersPolicy,
} from './patches/campaign-character-creation-patch'

// ---------------------------------------------------------------------------
// Campaign identity
// ---------------------------------------------------------------------------

export const campaignIdentitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  /** Storage key for the campaign banner image — resolve to a URL with `getAssetUrl`. */
  imageKey: z.string().optional(),
})

export type CampaignIdentity = z.infer<typeof campaignIdentitySchema>

// ---------------------------------------------------------------------------
// Campaign configuration
// ---------------------------------------------------------------------------

export const PLAY_STYLES = [
  'dungeon_crawl',
  'urban_adventure',
  'political_intrigue',
  'exploration',
  'survival',
  'mystery',
  'sandbox',
  'tactical_combat',
  'roleplay_driven',
] as const

export const playStyleSchema = z.enum(PLAY_STYLES)
export type PlayStyle = z.infer<typeof playStyleSchema>

export const MOODS = [
  'heroic',
  'dark_fantasy',
  'gritty',
  'horror',
  'humorous',
  'weird',
  'epic',
  'hopeful',
] as const

export const moodSchema = z.enum(MOODS)
export type Mood = z.infer<typeof moodSchema>

export const MAGIC_LEVELS = ['low_magic', 'standard_fantasy', 'high_magic'] as const

export const magicLevelSchema = z.enum(MAGIC_LEVELS)
export type MagicLevel = z.infer<typeof magicLevelSchema>

export const DIFFICULTIES = ['casual', 'dangerous', 'brutal'] as const

export const difficultySchema = z.enum(DIFFICULTIES)
export type Difficulty = z.infer<typeof difficultySchema>

export const campaignFlavorSchema = z.object({
  playStyle: z.array(playStyleSchema).optional(),
  mood: z.array(moodSchema).optional(),
  magicLevel: magicLevelSchema.optional(),
  difficulty: difficultySchema.optional(),
})

export type CampaignFlavor = z.infer<typeof campaignFlavorSchema>

export const campaignConfigurationSchema = z.object({
  flavor: campaignFlavorSchema.optional(),
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

/** Release references used to create a campaign; defaults are still snapshotted into campaign state. */
export const campaignPresetProvenanceSchema = z.object({
  campaignTemplate: versionedTemplateReferenceSchema,
  worldSeedPacks: z.array(versionedTemplateReferenceSchema),
})

export type CampaignPresetProvenance = z.infer<typeof campaignPresetProvenanceSchema>

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------

export const campaignSchema = z.object({
  id: z.string().min(1),
  identity: campaignIdentitySchema,
  configuration: campaignConfigurationSchema,
  status: campaignStatusSchema,
  visibility: campaignVisibilitySchema,
  /**
   * The system ruleset (content catalog version) this campaign uses. Pinned at
   * creation and immutable thereafter — homebrew and overlay patches are scoped
   * to it, so changing it would orphan that content.
   */
  rulesetId: systemRulesetIdSchema,
  /** Informational source releases. Updating shipped presets never mutates this campaign. */
  presetProvenance: campaignPresetProvenanceSchema.optional(),
  /** The userId who created this campaign. Immutable — distinct from the current owner, which is transferable. */
  createdBy: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Campaign = z.infer<typeof campaignSchema>

/**
 * Campaign returned from `GET /api/campaigns` — includes the caller's membership
 * role in that campaign.
 */
export const campaignListItemSchema = campaignSchema.extend({
  campaignRole: campaignRoleSchema,
})

export type CampaignListItem = z.infer<typeof campaignListItemSchema>

// ---------------------------------------------------------------------------
// Create campaign input
// ---------------------------------------------------------------------------

/**
 * Client-facing payload for creating a campaign. `createdBy` is set server-side
 * from the session, so the client only sends the campaign identity and initial
 * configuration. All fields except `name` are optional — the server applies
 * defaults for any omitted configuration.
 */
export const createCampaignInputSchema = campaignIdentitySchema.extend({
  /** Stable shipped template id. Resolved server-side; its release reference is stored as provenance. */
  campaignTemplateId: z.string().min(1).optional(),
  /** Written to CampaignRulesetPatch on create — not stored on the campaign document. */
  characterCreation: updateCampaignCharacterCreationInputSchema.optional(),
  flavor: campaignFlavorSchema.optional(),
  /** Optional at create; the server falls back to `DEFAULT_SYSTEM_RULESET_ID`. */
  rulesetId: systemRulesetIdSchema.optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignInputSchema>

// ---------------------------------------------------------------------------
// Update campaign input
// ---------------------------------------------------------------------------

/**
 * Partial update payload. All fields are optional; the server merges the patch
 * with the existing campaign document. `imageKey` is set server-side after an
 * upload completes, so clients send the key returned by the upload service.
 * `rulesetId` is intentionally omitted — it is immutable after creation.
 */
export const updateCampaignInputSchema = createCampaignInputSchema
  .partial({ name: true })
  .omit({ rulesetId: true, characterCreation: true, campaignTemplateId: true })

export type UpdateCampaignInput = z.infer<typeof updateCampaignInputSchema>

// ---------------------------------------------------------------------------
// Select campaign input
// ---------------------------------------------------------------------------

/**
 * Payload for remembering the user's most recently selected campaign. The
 * server validates that the user is a member before persisting.
 */
export const selectCampaignInputSchema = z.object({
  campaignId: z.string().min(1),
})

export type SelectCampaignInput = z.infer<typeof selectCampaignInputSchema>

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
