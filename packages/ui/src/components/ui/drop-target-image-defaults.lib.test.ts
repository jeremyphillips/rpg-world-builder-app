import { DEFAULT_UPLOAD_MAX_BYTES } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  IMAGE_DROP_TARGET_ACCEPT,
  resolveImageDropTargetDefaults,
} from './drop-target-image-defaults.lib'

describe('resolveImageDropTargetDefaults', () => {
  it('returns shared image accept, comfortable density, and default max size', () => {
    expect(resolveImageDropTargetDefaults()).toEqual({
      accept: IMAGE_DROP_TARGET_ACCEPT,
      density: 'comfortable',
      maxSize: DEFAULT_UPLOAD_MAX_BYTES,
    })
  })

  it('omits maxSize until a byte ceiling is known', () => {
    expect(resolveImageDropTargetDefaults({ includeMaxSize: false })).toEqual({
      accept: IMAGE_DROP_TARGET_ACCEPT,
      density: 'comfortable',
    })
  })
})
