import type {
  AdminUserListItem,
  AdminUsersAccessFilter,
  AdminUsersActivityFilter,
} from '@rpg/contracts'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterSchema,
} from '@rpg/ui/filters'

import { adminUsersActivityFilterLabel, adminUsersInactiveFilterLabel } from './admin-users-labels'

export type AdminUsersFilterState = {
  q?: string
  access?: 'all' | 'user' | 'admin' | 'superadmin'
  activity?: 'all' | 'active' | 'inactive' | 'never'
}

const ACCESS_OPTIONS = [
  { value: 'all', label: 'All access' },
  { value: 'user', label: 'Users' },
  { value: 'admin', label: 'Admins' },
  { value: 'superadmin', label: 'Superadmins' },
] as const

const ACTIVITY_OPTIONS = [
  { value: 'all', label: 'All activity' },
  { value: 'active', label: adminUsersActivityFilterLabel() },
  { value: 'inactive', label: adminUsersInactiveFilterLabel() },
  { value: 'never', label: 'Never active' },
] as const

/** Filter chrome for the admin users table — predicates are server-driven. */
export function adminUsersFilterSchema(): FilterSchema<AdminUserListItem, AdminUsersFilterState> {
  return createFilterSchema([
    createTextFilter<AdminUserListItem, AdminUsersFilterState, 'q'>({
      id: 'q',
      label: 'Search',
      placeholder: 'Search users…',
      url: { key: 'q' },
      getSearchText: (row) => `${row.displayName} ${row.email}`,
    }),
    createEqualsFilter<AdminUserListItem, AdminUsersFilterState, 'access', AdminUsersAccessFilter>({
      id: 'access',
      label: 'Access',
      options: [...ACCESS_OPTIONS],
      getValue: (row) => row.role,
    }),
    createEqualsFilter<
      AdminUserListItem,
      AdminUsersFilterState,
      'activity',
      AdminUsersActivityFilter
    >({
      id: 'activity',
      label: 'Activity',
      placement: 'advanced',
      layout: 'stacked',
      width: 'md',
      options: [...ACTIVITY_OPTIONS],
      getValue: () => 'all',
    }),
  ])
}

export function toAdminUsersListQuery(
  filters: AdminUsersFilterState,
  sort: string,
  page: number,
  pageSize = 20,
) {
  return {
    q: filters.q,
    access: filters.access ?? 'all',
    activity: filters.activity ?? 'all',
    sort: sort as
      | 'displayName'
      | '-displayName'
      | 'role'
      | '-role'
      | 'lastActiveAt'
      | '-lastActiveAt'
      | 'createdAt'
      | '-createdAt',
    page,
    pageSize,
  }
}
