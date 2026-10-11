import { describe, expect, it } from 'vitest'
import { contentTypeKeysWithDeferredAuthoring } from '@rpg/content-types'

import { CONTENT_ROUTES } from '@/app/content-routes'
import * as lazyRoutes from '@/app/lazy-routes'
import { VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew/lib/hub/content-registry'

describe('deferred content authoring', () => {
  it('omits create and edit routes and lifecycle affordances', () => {
    expect(contentTypeKeysWithDeferredAuthoring()).toEqual(['monsters'])

    const monsters = CONTENT_ROUTES.monsters
    expect(monsters).not.toHaveProperty('create')
    expect(monsters).not.toHaveProperty('edit')
    expect(lazyRoutes).not.toHaveProperty('MonsterCreateRoute')
    expect(lazyRoutes).not.toHaveProperty('MonsterEditRoute')

    const hub = VISIBLE_SIDEBAR_CONTENT.find((entry) => entry.contentType === 'monsters')
    expect(hub?.create).toBeUndefined()
  })
})
