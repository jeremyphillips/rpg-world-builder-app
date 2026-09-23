import { describe, expect, it } from 'vitest'

import {
  DROP_TARGET_ACTIVE_TITLE,
  DROP_TARGET_INVALID_MESSAGE,
  isImageAcceptList,
  resolveDropTargetCopy,
  resolveDropTargetRequirements,
} from './drop-target-copy.lib'

describe('resolveDropTargetCopy', () => {
  it('uses singular image copy for a single image accept list', () => {
    expect(
      resolveDropTargetCopy({
        accept: ['image/jpeg', 'image/png'],
        multiple: false,
      }),
    ).toEqual({
      title: 'Add an image',
      description: 'Drag and drop an image here, or choose a file.',
      useImageIcon: true,
    })
  })

  it('uses plural image copy for multiple uploads', () => {
    expect(
      resolveDropTargetCopy({
        accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        multiple: true,
      }),
    ).toEqual({
      title: 'Add images',
      description: 'Drag and drop images here, or choose files.',
      useImageIcon: true,
    })
  })

  it('uses file copy for non-image accept lists', () => {
    expect(
      resolveDropTargetCopy({
        accept: ['application/pdf'],
        multiple: false,
      }),
    ).toEqual({
      title: 'Add a file',
      description: 'Drag and drop a file here, or choose a file.',
      useImageIcon: false,
    })
  })
})

describe('resolveDropTargetRequirements', () => {
  it('joins accept labels with a serial or and appends max size', () => {
    expect(
      resolveDropTargetRequirements({
        accept: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        maxSize: 20_971_520,
      }),
    ).toBe('PNG, JPG, WEBP, or GIF · Max 20 MB')
  })

  it('omits the size clause when maxSize is unset', () => {
    expect(
      resolveDropTargetRequirements({
        accept: ['image/jpeg', 'image/png'],
      }),
    ).toBe('JPG or PNG')
  })
})

describe('isImageAcceptList', () => {
  it('returns true only when every accept entry is image-like', () => {
    expect(isImageAcceptList(['image/jpeg', 'image/png'])).toBe(true)
    expect(isImageAcceptList(['image/jpeg', 'application/pdf'])).toBe(false)
  })
})

describe('shared drop target messages', () => {
  it('exports active and invalid titles', () => {
    expect(DROP_TARGET_ACTIVE_TITLE).toBe('Drop to upload')
    expect(DROP_TARGET_INVALID_MESSAGE).toBe("These files can't be added")
  })
})
