import { describe, expect, it } from 'vitest'

import { resolveFrameCropCompatibility } from './content-media-image-frame.lib'

const portraitDisplay = {
  src: '/hero.png',
  role: 'portrait' as const,
  sourceKind: 'upload' as const,
  crop: { x: 0.1, y: 0.1, width: 0.3, height: 0.3 },
}

const primaryDisplay = {
  src: '/hero.png',
  role: 'primary' as const,
  sourceKind: 'upload' as const,
  crop: { x: 0, y: 0.1, width: 0.9, height: 0.675 },
}

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

  it('throws in test when builderCard receives a saved crop', () => {
    expect(() => resolveFrameCropCompatibility(portraitDisplay, 'builderCard')).toThrow(
      /does not accept role crop/,
    )
  })

  it('uses crop mode when square frame carries a primary-only catalog crop', () => {
    expect(resolveFrameCropCompatibility(primaryDisplay, 'square')).toEqual({
      display: primaryDisplay,
      renderMode: 'crop',
    })
  })

  it('throws in test when portrait crop is shown in a primary frame', () => {
    expect(() => resolveFrameCropCompatibility(portraitDisplay, 'primary')).toThrow(
      /does not accept role crop "portrait"/,
    )
  })
})
