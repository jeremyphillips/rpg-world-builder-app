import { describe, expect, it, vi } from 'vitest'
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

  it.each([{}, { ClassCreate: 'invalid component' }])(
    'rejects a malformed class create chunk: %j',
    async (exports) => {
      vi.doMock('@/features/content/classes/routes/class-create', () => exports)
      try {
        await expect(contentFormRouteLoaders.classes.create()).rejects.toThrow(
          'Content form route export "ClassCreate" must be a component.',
        )
      } finally {
        vi.doUnmock('@/features/content/classes/routes/class-create')
      }
    },
  )
})
