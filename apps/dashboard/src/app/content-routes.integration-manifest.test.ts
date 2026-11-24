import { describe, expect, it } from 'vitest'
import {
  contentTypeKeysWithFormDefinition,
  contentTypeKeysWithRouteSection,
} from '@rpg/content-types'

import { CONTENT_ROUTES } from './content-routes'
import { contentFormRouteLoaders } from './lazy-routes'

describe('CONTENT_ROUTES integration manifest (dashboard routes layer)', () => {
  it('declares a route section for every manifest type with dashboard routes', () => {
    for (const { routeSection } of contentTypeKeysWithRouteSection()) {
      expect(routeSection in CONTENT_ROUTES, `CONTENT_ROUTES missing ${routeSection}`).toBe(true)
    }
  })
})

describe('production content form route loaders', () => {
  it('covers every form-capable content type', () => {
    expect(Object.keys(contentFormRouteLoaders).sort()).toEqual(contentTypeKeysWithFormDefinition())
  })
})
