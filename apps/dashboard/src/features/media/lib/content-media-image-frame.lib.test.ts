import { describe, expect, it } from 'vitest'

import { resolveFramePresentation } from './content-media-image-frame.lib'

const portraitDisplay = {
  src: '/hero.png',
  role: 'portrait' as const,
  sourceKind: 'upload' as const,
  crop: { x: 0.1, y: 0.1, width: 0.3, height: 0.3 },
}

const primaryRoleCrop = { x: 0.2, y: 0.15, width: 0.6, height: 0.45 }

describe('resolveFramePresentation', () => {
  it('uses authored crop when frame and role aspects match', () => {
    expect(
      resolveFramePresentation({
        role: 'primary',
        authoredCrop: primaryRoleCrop,
        frame: 'primary',
      }),
    ).toEqual({
      mode: 'crop',
      effectiveCrop: primaryRoleCrop,
    })
  })

  it('derives the builderCard effective crop from authored crop and focal point', () => {
    expect(
      resolveFramePresentation({
        role: 'primary',
        authoredCrop: primaryRoleCrop,
        focalPoint: { x: 0.5, y: 0.3 },
        frame: 'builderCard',
      }),
    ).toEqual({
      mode: 'crop',
      effectiveCrop: { x: 0.2, y: 0.15, width: 0.6, height: 0.3 },
    })
  })

  it('derives a square effective crop within a primary role crop', () => {
    expect(
      resolveFramePresentation({
        role: 'primary',
        authoredCrop: primaryRoleCrop,
        frame: 'square',
      }),
    ).toEqual({
      mode: 'crop',
      effectiveCrop: { x: 0.275, y: 0.15, width: 0.45, height: 0.45 },
    })
  })

  it('uses cover when there is no authored crop', () => {
    expect(resolveFramePresentation({ role: 'primary', frame: 'builderCard' })).toEqual({
      mode: 'cover',
    })
  })

  it('uses contain for emblem frames', () => {
    expect(resolveFramePresentation({ role: 'emblem', frame: 'emblemHero' })).toEqual({
      mode: 'contain',
    })
  })

  it.each(['builderCard', 'primary'] as const)(
    'throws when %s receives a portrait role crop',
    (frame) => {
      expect(() =>
        resolveFramePresentation({
          role: 'portrait',
          authoredCrop: portraitDisplay.crop,
          frame,
        }),
      ).toThrow(/does not accept role crop "portrait"/)
    },
  )
})
