import { describe, expect, it } from 'vitest'

import { HttpError } from '../../../lib/http-error'
import { assertSlugAvailable } from './assert-slug-available'

const systemSlugs = new Set(['fighter', 'wizard'])

describe('assertSlugAvailable', () => {
  it('passes for a slug that is neither a system nor an existing homebrew slug', () => {
    expect(() =>
      assertSlugAvailable({ slug: 'blood-hunter', systemSlugs, campaignSlugs: new Set() }),
    ).not.toThrow()
  })

  it('rejects a slug that shadows a system slug (409)', () => {
    try {
      assertSlugAvailable({ slug: 'fighter', systemSlugs, campaignSlugs: new Set() })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError)
      expect((err as HttpError).status).toBe(409)
    }
  })

  it('rejects a slug already used by homebrew in the campaign (409)', () => {
    try {
      assertSlugAvailable({
        slug: 'blood-hunter',
        systemSlugs,
        campaignSlugs: new Set(['blood-hunter']),
      })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError)
      expect((err as HttpError).status).toBe(409)
    }
  })
})
