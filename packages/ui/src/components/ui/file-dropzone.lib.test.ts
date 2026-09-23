import { describe, expect, it } from 'vitest'

import {
  matchesAccept,
  resolveFileDropzonePromptState,
  resolveFileDropzoneVisibility,
  resolveNextDropzoneFiles,
  validateDropzoneFiles,
} from './file-dropzone.lib'

function makeFile(name: string, type: string, size = 1024): File {
  return new File(['x'.repeat(size)], name, { type })
}

describe('file-dropzone.lib', () => {
  it('matches accept patterns', () => {
    const file = makeFile('photo.jpg', 'image/jpeg')
    expect(matchesAccept(file, ['image/jpeg'])).toBe(true)
    expect(matchesAccept(file, ['image/*'])).toBe(true)
    expect(matchesAccept(file, ['image/png'])).toBe(false)
  })

  it('validates MIME and size', () => {
    const accepted = validateDropzoneFiles(
      [makeFile('a.jpg', 'image/jpeg', 100)],
      ['image/jpeg'],
      500,
    )
    expect(accepted.error).toBeNull()
    expect(accepted.accepted).toHaveLength(1)

    const rejected = validateDropzoneFiles(
      [makeFile('big.jpg', 'image/jpeg', 1024)],
      ['image/jpeg'],
      500,
    )
    expect(rejected.accepted).toHaveLength(0)
    expect(rejected.error).toMatch(/exceeds/i)
  })

  it('resolves next files for single and multiple modes', () => {
    const first = makeFile('a.jpg', 'image/jpeg')
    const second = makeFile('b.jpg', 'image/jpeg')
    expect(resolveNextDropzoneFiles([], [first], false)).toEqual([first])
    expect(resolveNextDropzoneFiles([first], [second], true, 2)).toEqual([first, second])
    expect(resolveNextDropzoneFiles([first], [second], true, 1)).toEqual([first])
  })

  it('resolves dropzone visibility', () => {
    expect(
      resolveFileDropzoneVisibility({
        value: [],
        multiple: false,
        existingImageUrl: '/saved.png',
      }),
    ).toEqual({
      showDropZone: true,
      showExistingImage: true,
      showFileList: true,
    })
    expect(
      resolveFileDropzoneVisibility({
        value: [makeFile('a.jpg', 'image/jpeg')],
        multiple: false,
        maxFiles: 1,
      }),
    ).toEqual({
      showDropZone: false,
      showExistingImage: false,
      showFileList: true,
    })
  })

  it('resolves prompt state', () => {
    expect(
      resolveFileDropzonePromptState({ disabled: true, isDragOver: true, dropTarget: true }),
    ).toBe('disabled')
    expect(
      resolveFileDropzonePromptState({ disabled: false, isDragOver: true, dropTarget: true }),
    ).toBe('active')
    expect(
      resolveFileDropzonePromptState({ disabled: false, isDragOver: true, dropTarget: false }),
    ).toBe('idle')
  })
})
