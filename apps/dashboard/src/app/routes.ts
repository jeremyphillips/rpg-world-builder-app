import { ADMIN_ROUTES } from './admin-routes'
import { CONTENT_ROUTES } from './content-routes'
import { HOMEBREW_ROUTES } from './homebrew-routes'

export const ROUTES = {
  home: '/',
  characters: {
    list: '/characters',
    new: '/characters/new',
    import: '/characters/import',
    detail: (characterId: string) => `/characters/${characterId}`,
  },
  account: '/account',
  nameGenerator: '/name-generator',
  campaign: {
    create: '/campaigns/new',
    detail: (id: string) => `/campaigns/${id}`,
    sessions: (id: string) => `/campaigns/${id}/sessions`,
    settings: (id: string) => `/campaigns/${id}/settings`,
    npcs: {
      list: (id: string) => `/campaigns/${id}/npcs`,
      new: (id: string) => `/campaigns/${id}/npcs/new`,
      import: (id: string) => `/campaigns/${id}/npcs/import`,
      detail: (id: string, npcId: string) => `/campaigns/${id}/npcs/${npcId}`,
    },
  },
  admin: ADMIN_ROUTES,
  content: CONTENT_ROUTES,
  homebrew: HOMEBREW_ROUTES,
} as const
