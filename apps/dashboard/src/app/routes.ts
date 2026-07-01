import { ADMIN_ROUTES } from './admin-routes'
import { CONTENT_ROUTES } from './content-routes'
import { HOMEBREW_ROUTES } from './homebrew-routes'

export const ROUTES = {
  home: '/',
  characters: {
    list: '/characters',
    detail: (characterId: string) => `/characters/${characterId}`,
  },
  account: '/account',
  campaign: {
    create: '/campaigns/new',
    detail: (id: string) => `/campaigns/${id}`,
    sessions: (id: string) => `/campaigns/${id}/sessions`,
    settings: (id: string) => `/campaigns/${id}/settings`,
  },
  admin: ADMIN_ROUTES,
  content: CONTENT_ROUTES,
  homebrew: HOMEBREW_ROUTES,
} as const
