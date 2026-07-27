import { z } from 'zod'

// ---------------------------------------------------------------------------
// Platform roles — stored on the User document (global, not campaign-scoped)
// ---------------------------------------------------------------------------

/**
 * Roles that govern access to the platform itself. Every registered account
 * gets `user` by default. `admin` and `superadmin` are elevated by staff.
 */
export const PLATFORM_ROLES = ['user', 'admin', 'superadmin'] as const

export const platformRoleSchema = z.enum(PLATFORM_ROLES)

export type PlatformRole = z.infer<typeof platformRoleSchema>

export const PLATFORM_ROLE_TERM = {
  label: 'Access',
  description: 'Platform-wide role that governs admin and staff capabilities.',
  sentence: {
    singular: 'access level',
    plural: 'access levels',
  },
} as const

export const PLATFORM_ROLE_ENTRIES = {
  user: {
    label: 'User',
    description: 'Standard account with no elevated platform permissions.',
    sentence: {
      singular: 'user',
      plural: 'users',
    },
  },
  admin: {
    label: 'Admin',
    description: 'Staff account that can access admin surfaces.',
    sentence: {
      singular: 'admin',
      plural: 'admins',
    },
  },
  superadmin: {
    label: 'Superadmin',
    description: 'Owner account with unrestricted platform permissions.',
    sentence: {
      singular: 'superadmin',
      plural: 'superadmins',
    },
  },
} as const satisfies Record<
  PlatformRole,
  { label: string; description: string; sentence: { singular: string; plural: string } }
>

// ---------------------------------------------------------------------------
// Campaign roles — stored on CampaignMembership (scoped to a single campaign)
// ---------------------------------------------------------------------------

/**
 * Roles that govern what a user can do within a specific campaign.
 * These must always be checked in the context of a campaign; they have no
 * meaning at the global level.
 *
 * - owner    → campaign creator / DM; full control
 * - co-owner → invited co-DM; same as owner minus transferring/deleting
 * - pc       → player with a submitted character in the party
 * - observer → spectator; read-only, no character submission
 */
export const CAMPAIGN_ROLES = ['owner', 'co-owner', 'pc', 'observer'] as const

export const campaignRoleSchema = z.enum(CAMPAIGN_ROLES)

export type CampaignRole = z.infer<typeof campaignRoleSchema>

/** Roles that can manage campaign settings and author content (matches API write guards). */
export const CAMPAIGN_MANAGE_ROLES = [
  'owner',
  'co-owner',
] as const satisfies readonly CampaignRole[]

export type CampaignManageRole = (typeof CAMPAIGN_MANAGE_ROLES)[number]
