/** Platform admin route helpers. */
export const ADMIN_ROUTES = {
  users: '/admin/users',
  user: {
    detail: (userId: string) => `/admin/users/${userId}`,
    campaigns: (userId: string) => `/admin/users/${userId}/campaigns`,
    characters: (userId: string) => `/admin/users/${userId}/characters`,
  },
  settings: '/admin/settings',
} as const
