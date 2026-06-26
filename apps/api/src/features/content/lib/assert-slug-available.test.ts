import { describe, expect, it } from 'vitest'

import { assertSlugAvailable } from './assert-slug-available'
import { expectHttpError } from '../../../test/expect-http-error'

const systemSlugs = new Set(['fighter', 'wizard'])

describe('assertSlugAvailable', () => {
  it('passes for a slug that is neither a system nor an existing homebrew slug', () => {
    expect(() =>
      assertSlugAvailable({ slug: 'blood-hunter', systemSlugs, campaignSlugs: new Set() }),
    ).not.toThrow()
  })

  it('rejects a slug that shadows a system slug (409)', () => {
    expectHttpError(
      () => assertSlugAvailable({ slug: 'fighter', systemSlugs, campaignSlugs: new Set() }),
      409,
    )
  })

  it('rejects a slug already used by homebrew in the campaign (409)', () => {
    expectHttpError(
      () =>
        assertSlugAvailable({
          slug: 'blood-hunter',
          systemSlugs,
          campaignSlugs: new Set(['blood-hunter']),
        }),
      409,
    )
  })
})
