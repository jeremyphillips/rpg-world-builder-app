import { describe, expect, it } from 'vitest'

import { resolveLocationCreatePageModel } from './location-create-page.lib'

describe('resolveLocationCreatePageModel', () => {
  it('maps ready fixed sessions to initial values and fixed create context', () => {
    expect(
      resolveLocationCreatePageModel(
        { kind: 'ready', fixedCreate: { authoringType: 'building' } },
        'location-soft-parent',
        'location-primary-world',
      ),
    ).toEqual({
      fixedCreate: { authoringType: 'building' },
      initialValues: {
        authoringType: 'building',
        parentLocationId: 'location-soft-parent',
      },
    })
  })

  it('maps unrestricted sessions to soft parent initial values only', () => {
    expect(
      resolveLocationCreatePageModel({ kind: 'unrestricted' }, undefined, 'location-primary-world'),
    ).toEqual({
      initialValues: { parentLocationId: 'location-primary-world' },
    })
  })
})
