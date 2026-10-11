import { describe, expect, it } from 'vitest'
import { contentTypeKeysWithDeferredAuthoring } from '@rpg/content-types'

import { CONTENT_ROUTES } from '@/app/content-routes'
import * as lazyRoutes from '@/app/lazy-routes'
import { VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew/lib/hub/content-registry'

describe('deferred content authoring', () => {
  it('omits create and edit routes for every deferred type', () => {
    expect(contentTypeKeysWithDeferredAuthoring()).toEqual([])
    for (const key of contentTypeKeysWithDeferredAuthoring()) {
      const section = CONTENT_ROUTES[key as keyof typeof CONTENT_ROUTES]
      expect(section).not.toHaveProperty('create')
      expect(section).not.toHaveProperty('edit')
    }
  })

  it('exposes monster create and edit affordances', () => {
    expect(CONTENT_ROUTES.monsters).toHaveProperty('create')
    expect(CONTENT_ROUTES.monsters).toHaveProperty('edit')
    expect(lazyRoutes).toHaveProperty('MonsterCreateRoute')
    expect(lazyRoutes).toHaveProperty('MonsterEditRoute')
    const hub = VISIBLE_SIDEBAR_CONTENT.find((entry) => entry.contentType === 'monsters')
    expect(hub?.create).toBeTypeOf('function')
  })
})
