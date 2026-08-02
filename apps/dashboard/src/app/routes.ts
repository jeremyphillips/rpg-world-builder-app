import { ADMIN_ROUTES } from './admin-routes'
import { CONTENT_ROUTES } from './content-routes'
import { GAME_TERMS_ROUTES } from './game-terms-routes'
import { HOMEBREW_ROUTES } from './homebrew-routes'
import type { GlobalSearchUrlGroup } from '@rpg/contracts'

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
  campaignInvites: {
    detail: (inviteId: string) => `/campaign-invites/${inviteId}`,
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
    onboardingReconnect: (id: string, options?: { characterId?: string }) => {
      const params = new URLSearchParams({ mode: 'reconnect' })
      if (options?.characterId) {
        params.set('characterId', options.characterId)
      }
      return `/campaigns/${id}/onboarding?${params.toString()}`
    },
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
    search: (campaignId: string, options?: { q?: string; group?: GlobalSearchUrlGroup }) => {
      const params = new URLSearchParams()
      const trimmedQuery = options?.q?.trim()

      if (trimmedQuery) {
        params.set('q', trimmedQuery)
      }

      if (options?.group && options.group !== 'all') {
        params.set('group', options.group)
      }

      const query = params.toString()
      return query ? `/campaigns/${campaignId}/search?${query}` : `/campaigns/${campaignId}/search`
    },
  },
  admin: ADMIN_ROUTES,
  content: CONTENT_ROUTES,
  gameTerms: GAME_TERMS_ROUTES,
  homebrew: HOMEBREW_ROUTES,
} as const
