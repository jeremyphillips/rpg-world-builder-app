import { describe, expect, it } from 'vitest'

import { deriveFrameCropWithinRoleCrop } from '@rpg/contracts'

import { resolveFrameCropCompatibility } from './content-media-image-frame.lib'

const portraitDisplay = {
  src: '/hero.png',
  role: 'portrait' as const,
  sourceKind: 'upload' as const,
  crop: { x: 0.1, y: 0.1, width: 0.3, height: 0.3 },
}

const primaryRoleCrop = { x: 0, y: 0.1, width: 0.9, height: 0.675 }

const primaryDisplay = {
  src: '/hero.png',
  role: 'primary' as const,
  sourceKind: 'upload' as const,
  crop: primaryRoleCrop,
}

const primarySquareDerivedCrop = deriveFrameCropWithinRoleCrop(primaryRoleCrop, 4 / 3, 1)

const primaryBuilderCardDerivedCrop = deriveFrameCropWithinRoleCrop(primaryRoleCrop, 4 / 3, 2)

describe('resolveFrameCropCompatibility', () => {
  it('uses crop mode when square frame matches portrait role', () => {
    expect(resolveFrameCropCompatibility(portraitDisplay, 'square')).toEqual({
      display: portraitDisplay,
      renderMode: 'crop',
    })
  })

  it('uses crop mode when primary frame matches primary role', () => {
    expect(resolveFrameCropCompatibility(primaryDisplay, 'primary')).toEqual({
      display: primaryDisplay,
      renderMode: 'crop',
    })
  })

  it('throws in test when builderCard receives a portrait role crop', () => {
    expect(() => resolveFrameCropCompatibility(portraitDisplay, 'builderCard')).toThrow(
      /does not accept role crop/,
    )
  })

  it('derives a 2:1 crop for builderCard primary role crops', () => {
    expect(resolveFrameCropCompatibility(primaryDisplay, 'builderCard')).toEqual({
      display: { ...primaryDisplay, crop: primaryBuilderCardDerivedCrop },
      renderMode: 'crop',
    })
  })

  it('derives a 1:1 crop when square frame carries a primary role crop', () => {
    expect(resolveFrameCropCompatibility(primaryDisplay, 'square')).toEqual({
      display: { ...primaryDisplay, crop: primarySquareDerivedCrop },
      renderMode: 'crop',
    })
  })

  it('throws in test when portrait crop is shown in a primary frame', () => {
    expect(() => resolveFrameCropCompatibility(portraitDisplay, 'primary')).toThrow(
      /does not accept role crop "portrait"/,
    )
  })
})
