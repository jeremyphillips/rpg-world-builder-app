import { describe, expect, it } from 'vitest'

import { resolveOffsetFromDragDelta } from './media-emblem-editor.lib'

describe('resolveOffsetFromDragDelta', () => {
  it('maps viewport drag to normalized offset using canvas travel', () => {
    expect(
      resolveOffsetFromDragDelta({
        startOffset: { x: 0, y: 0 },
        deltaX: 32,
        deltaY: -16,
        maxTranslationX: 64,
        maxTranslationY: 64,
        viewportSize: 256,
      }),
    ).toEqual({ x: 0.5, y: -0.25 })
  })

  it('ignores drag on axes with no available travel', () => {
    expect(
      resolveOffsetFromDragDelta({
        startOffset: { x: 0.5, y: 0 },
        deltaX: 40,
        deltaY: 40,
        maxTranslationX: 0,
        maxTranslationY: 64,
        viewportSize: 256,
      }),
    ).toEqual({ x: 0, y: 0.625 })
  })
})
