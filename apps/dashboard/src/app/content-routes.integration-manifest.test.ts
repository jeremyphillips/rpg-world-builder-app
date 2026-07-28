import { describe, expect, it } from 'vitest'
import { contentTypeKeysWithRouteSection } from '@rpg/content-types'

import { CONTENT_ROUTES } from './content-routes'

describe('CONTENT_ROUTES integration manifest (dashboard routes layer)', () => {
  it('declares a route section for every manifest type with dashboard routes', () => {
    for (const { routeSection } of contentTypeKeysWithRouteSection()) {
      expect(routeSection in CONTENT_ROUTES, `CONTENT_ROUTES missing ${routeSection}`).toBe(true)
    }
  })
})
