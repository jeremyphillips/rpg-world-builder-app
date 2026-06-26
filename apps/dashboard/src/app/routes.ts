import { CONTENT_ROUTES } from './content-routes'
import { HOMEBREW_ROUTES } from './homebrew-routes'

export const ROUTES = {
  home: '/',
  characters: '/characters',
  profile: '/profile',
  account: '/account',
  campaign: {
    create: '/campaigns/new',
    detail: (id: string) => `/campaigns/${id}`,
    sessions: (id: string) => `/campaigns/${id}/sessions`,
    settings: (id: string) => `/campaigns/${id}/settings`,
  },
  admin: {
    users: '/admin/users',
    settings: '/admin/settings',
  },
  content: CONTENT_ROUTES,
  homebrew: HOMEBREW_ROUTES,
} as const
