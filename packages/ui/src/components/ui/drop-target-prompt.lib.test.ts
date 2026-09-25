import { describe, expect, it } from 'vitest'

import {
  resolveDropTargetLayoutBehavior,
  resolveDropTargetPromptState,
  resolveDropTargetPromptTitle,
} from './drop-target-prompt.lib'

describe('drop-target-prompt.lib', () => {
  it('resolves disabled state ahead of explicit state', () => {
    expect(resolveDropTargetPromptState(true, 'active')).toBe('disabled')
    expect(resolveDropTargetPromptState(false, 'active')).toBe('active')
    expect(resolveDropTargetPromptState(false)).toBe('idle')
  })

  it('preserves inline idle chrome during overlay states', () => {
    expect(resolveDropTargetLayoutBehavior('inline', 'active')).toEqual({
      hideIdleChromeInPlace: true,
      showIdleChrome: true,
    })
    expect(resolveDropTargetLayoutBehavior('cover', 'active')).toEqual({
      hideIdleChromeInPlace: false,
      showIdleChrome: false,
    })
  })

  it('resolves overlay titles', () => {
    expect(resolveDropTargetPromptTitle('active', 'Add an image')).toBe('Drop to upload')
    expect(resolveDropTargetPromptTitle('invalid', 'Add an image')).toBe(
      "These files can't be added",
    )
    expect(resolveDropTargetPromptTitle('idle', 'Add an image')).toBe('Add an image')
  })
})
