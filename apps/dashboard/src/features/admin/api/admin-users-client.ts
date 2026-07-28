import type {
  AdminUserDeletionPreview,
  AdminUserDetailResponse,
  AdminUserCampaignListResponse,
  AdminUserCampaignListQuery,
  AdminUserCharacterListResponse,
  AdminUserCharacterListQuery,
  AdminUsersListQuery,
  AdminUsersListResponse,
} from '@rpg/contracts'

import { deleteJson, request } from '@/lib/api-client'

const ADMIN_USERS_QUERY_DEFAULTS = {
  access: 'all',
  activity: 'all',
  sort: '-createdAt',
  page: 1,
  pageSize: 20,
} as const satisfies Partial<AdminUsersListQuery>

export function buildAdminUsersQueryString(query: AdminUsersListQuery): string {
  const params = new URLSearchParams()

  if (query.q?.trim()) params.set('q', query.q.trim())
  if (query.access !== ADMIN_USERS_QUERY_DEFAULTS.access) params.set('access', query.access)
  if (query.activity !== ADMIN_USERS_QUERY_DEFAULTS.activity) {
    params.set('activity', query.activity)
  }
  if (query.sort !== ADMIN_USERS_QUERY_DEFAULTS.sort) params.set('sort', query.sort)
  if (query.page !== ADMIN_USERS_QUERY_DEFAULTS.page) params.set('page', String(query.page))
  if (query.pageSize !== ADMIN_USERS_QUERY_DEFAULTS.pageSize) {
    params.set('pageSize', String(query.pageSize))
  }

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export async function listAdminUsers(query: AdminUsersListQuery): Promise<AdminUsersListResponse> {
  return request<AdminUsersListResponse>(
    `/api/admin/users${buildAdminUsersQueryString(query)}`,
    undefined,
    'Could not load users.',
  )
}

export async function fetchAdminUser(userId: string): Promise<AdminUserDetailResponse['user']> {
  const { user } = await request<AdminUserDetailResponse>(
    `/api/admin/users/${userId}`,
    undefined,
    'Could not load user.',
  )
  return user
}

function buildAdminUserCampaignsQueryString(query: AdminUserCampaignListQuery): string {
  const params = new URLSearchParams()
  if (query.q?.trim()) params.set('q', query.q.trim())
  if (query.role !== 'all') params.set('role', query.role)
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export async function listAdminUserCampaigns(
  userId: string,
  query: AdminUserCampaignListQuery,
): Promise<AdminUserCampaignListResponse['campaigns']> {
  const { campaigns } = await request<AdminUserCampaignListResponse>(
    `/api/admin/users/${userId}/campaigns${buildAdminUserCampaignsQueryString(query)}`,
    undefined,
    'Could not load campaigns.',
  )
  return campaigns
}

function buildAdminUserCharactersQueryString(query: AdminUserCharacterListQuery): string {
  const params = new URLSearchParams()
  if (query.q?.trim()) params.set('q', query.q.trim())
  if (query.campaign !== 'all') params.set('campaign', query.campaign)
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export async function listAdminUserCharacters(
  userId: string,
  query: AdminUserCharacterListQuery,
): Promise<AdminUserCharacterListResponse['characters']> {
  const { characters } = await request<AdminUserCharacterListResponse>(
    `/api/admin/users/${userId}/characters${buildAdminUserCharactersQueryString(query)}`,
    undefined,
    'Could not load characters.',
  )
  return characters
}

export async function fetchAdminUserDeletionPreview(
  userId: string,
): Promise<AdminUserDeletionPreview> {
  const { preview } = await request<{ preview: AdminUserDeletionPreview }>(
    `/api/admin/users/${userId}/deletion-preview`,
    undefined,
    'Could not load delete preview.',
  )
  return preview
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await deleteJson(`/api/admin/users/${userId}`, 'Could not delete user.')
}
