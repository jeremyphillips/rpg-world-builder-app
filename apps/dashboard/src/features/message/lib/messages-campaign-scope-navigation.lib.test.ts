import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'

import {
  resolveInvalidScopeRedirectPath,
  resolveMessagesClearScopePath,
} from './messages-campaign-scope-navigation.lib'

describe('messages-campaign-scope-navigation', () => {
  describe('resolveMessagesClearScopePath', () => {
    it('keeps the thread path when clearing scope from an open conversation', () => {
      expect(
        resolveMessagesClearScopePath({
          pathname: '/messages/conv_1',
          search: '?campaignId=camp_1',
        }),
      ).toBe(ROUTES.messages.detail('conv_1'))
    })

    it('preserves from and to when clearing scope from the new-message route', () => {
      expect(
        resolveMessagesClearScopePath({
          pathname: '/messages/new',
          search: '?from=conv_2&to=user_3&campaignId=camp_1',
        }),
      ).toBe(ROUTES.messages.new({ from: 'conv_2', to: 'user_3' }))
    })

    it('returns the global list when clearing scope from the list route', () => {
      expect(
        resolveMessagesClearScopePath({
          pathname: '/messages',
          search: '?campaignId=camp_1',
        }),
      ).toBe(ROUTES.messages.list)
    })
  })

  describe('resolveInvalidScopeRedirectPath', () => {
    it('strips scope from a thread while preserving the conversation id', () => {
      expect(
        resolveInvalidScopeRedirectPath({
          isThreadRoute: true,
          routeConversationId: 'conv_1',
          isNewRoute: false,
          search: '?campaignId=camp_1',
        }),
      ).toBe(ROUTES.messages.detail('conv_1'))
    })

    it('strips scope from the new-message route while preserving from', () => {
      expect(
        resolveInvalidScopeRedirectPath({
          isThreadRoute: false,
          isNewRoute: true,
          search: '?from=conv_2&campaignId=camp_1',
        }),
      ).toBe(ROUTES.messages.new({ from: 'conv_2' }))
    })

    it('falls back to the global list for invalid scoped list routes', () => {
      expect(
        resolveInvalidScopeRedirectPath({
          isThreadRoute: false,
          isNewRoute: false,
          search: '?campaignId=camp_1',
        }),
      ).toBe(ROUTES.messages.list)
    })
  })
})
