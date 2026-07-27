import { z } from 'zod'

import { platformRoleSchema } from './roles'

export const ADMIN_USER_DELETE_BLOCK_REASONS = [
  'insufficient_role',
  'self',
  'last_superadmin',
  'owns_campaigns',
] as const

export const adminUserDeleteBlockReasonSchema = z.enum(ADMIN_USER_DELETE_BLOCK_REASONS)

export type AdminUserDeleteBlockReason = z.infer<typeof adminUserDeleteBlockReasonSchema>

export const adminUserCampaignCountsSchema = z.object({
  owned: z.number().int().nonnegative(),
  coOwned: z.number().int().nonnegative(),
  joined: z.number().int().nonnegative(),
})

export type AdminUserCampaignCounts = z.infer<typeof adminUserCampaignCountsSchema>

export const adminUserListItemSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  email: z.email(),
  role: platformRoleSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  lastSignedInAt: z.iso.datetime().nullable(),
  lastActiveAt: z.iso.datetime().nullable(),
  campaignCounts: adminUserCampaignCountsSchema,
  characterCount: z.number().int().nonnegative(),
  canDelete: z.boolean(),
  deleteBlockedReasons: z.array(adminUserDeleteBlockReasonSchema),
})

export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>

export const adminUserDeletionPreviewSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    email: z.email(),
    role: platformRoleSchema,
  }),
  blockers: z.array(adminUserDeleteBlockReasonSchema),
  dependencies: z.object({
    characters: z.number().int().nonnegative(),
    memberships: adminUserCampaignCountsSchema,
    pendingInvites: z.number().int().nonnegative(),
    acceptedInvites: z.number().int().nonnegative(),
    controlledCharacters: z.number().int().nonnegative(),
  }),
})

export type AdminUserDeletionPreview = z.infer<typeof adminUserDeletionPreviewSchema>

export const ADMIN_USERS_ACCESS_FILTER_VALUES = ['all', 'user', 'admin', 'superadmin'] as const

export const adminUsersAccessFilterSchema = z.enum(ADMIN_USERS_ACCESS_FILTER_VALUES)

export type AdminUsersAccessFilter = z.infer<typeof adminUsersAccessFilterSchema>

export const ADMIN_USERS_ACTIVITY_FILTER_VALUES = ['all', 'active', 'inactive', 'never'] as const

export const adminUsersActivityFilterSchema = z.enum(ADMIN_USERS_ACTIVITY_FILTER_VALUES)

export type AdminUsersActivityFilter = z.infer<typeof adminUsersActivityFilterSchema>

export const ADMIN_USERS_SORT_FIELDS = ['displayName', 'role', 'lastActiveAt', 'createdAt'] as const

export const adminUsersListQuerySchema = z.object({
  q: z.string().optional(),
  access: adminUsersAccessFilterSchema.default('all'),
  activity: adminUsersActivityFilterSchema.default('all'),
  sort: z
    .enum([
      'displayName',
      '-displayName',
      'role',
      '-role',
      'lastActiveAt',
      '-lastActiveAt',
      'createdAt',
      '-createdAt',
    ])
    .default('-createdAt'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type AdminUsersListQuery = z.infer<typeof adminUsersListQuerySchema>

export const adminUsersListResponseSchema = z.object({
  users: z.array(adminUserListItemSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
})

export type AdminUsersListResponse = z.infer<typeof adminUsersListResponseSchema>
