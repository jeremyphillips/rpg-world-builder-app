import { describe, expect, it } from 'vitest'

import { resolveLocationCreatePageModel } from './location-create-page.lib'

describe('resolveLocationCreatePageModel', () => {
  it('maps prefill to initial values and optional facility narrowing context', () => {
    expect(
      resolveLocationCreatePageModel(
        { authoringType: 'building', facilityGroup: 'production' },
        'location-soft-parent',
        'location-primary-world',
      ),
    ).toEqual({
      formCtx: { buildingFacilityAuthoringGroup: 'production' },
      initialValues: {
        authoringType: 'building',
        parentLocationId: 'location-soft-parent',
      },
    })
  })

  it('defaults parent from soft URL param or primary world', () => {
    expect(resolveLocationCreatePageModel({}, undefined, 'location-primary-world')).toEqual({
      initialValues: { parentLocationId: 'location-primary-world' },
    })
  })
})
