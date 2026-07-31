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
  notifications: {
    list: '/notifications',
  },
  messages: {
    list: '/messages',
    listScoped: (campaignId: string) => `/messages?campaignId=${encodeURIComponent(campaignId)}`,
    new: (options?: { from?: string; to?: string; campaignId?: string }) => {
      const params = new URLSearchParams()
      if (options?.from) params.set('from', options.from)
      if (options?.to) params.set('to', options.to)
      if (options?.campaignId) params.set('campaignId', options.campaignId)
      const query = params.toString()
      return query ? `/messages/new?${query}` : '/messages/new'
    },
    detail: (conversationId: string, options?: { campaignId?: string }) => {
      if (!options?.campaignId) return `/messages/${conversationId}`
      return `/messages/${conversationId}?campaignId=${encodeURIComponent(options.campaignId)}`
    },
  },
  campaign: {
    list: '/campaigns',
    create: '/campaigns/new',
    detail: (id: string) => `/campaigns/${id}`,
    sessions: (id: string) => `/campaigns/${id}/sessions`,
    settings: (id: string) => `/campaigns/${id}/settings`,
    onboarding: (id: string) => `/campaigns/${id}/onboarding`,
    characters: {
      list: (campaignId: string) => `/campaigns/${campaignId}/characters`,
      detail: (campaignId: string, characterId: string) =>
        `/campaigns/${campaignId}/characters/${characterId}`,
    },
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
