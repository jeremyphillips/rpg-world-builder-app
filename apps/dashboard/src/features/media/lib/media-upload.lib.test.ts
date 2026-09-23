import { describe, expect, it } from 'vitest'

import {
  areMediaImageFilesValid,
  areMediaImageTypesValid,
  canAcceptDraggedMediaFiles,
  isExternalFileDrag,
  isMediaImageFile,
} from './media-upload.lib'

function makeFile(name: string, type: string, size = 1024): File {
  return new File(['x'.repeat(size)], name, { type })
}

describe('media upload validation', () => {
  it('accepts supported image mime types', () => {
    expect(isMediaImageFile(makeFile('photo.jpg', 'image/jpeg'))).toBe(true)
    expect(isMediaImageFile(makeFile('doc.pdf', 'application/pdf'))).toBe(false)
  })

  it('rejects mixed or oversized file sets as a whole', () => {
    expect(areMediaImageFilesValid([makeFile('photo.jpg', 'image/jpeg', 1000)], 500)).toBe(false)
    expect(
      areMediaImageFilesValid(
        [makeFile('photo.jpg', 'image/jpeg'), makeFile('doc.pdf', 'application/pdf')],
        5000,
      ),
    ).toBe(false)
  })

  it('accepts supported image types regardless of size', () => {
    expect(areMediaImageTypesValid([makeFile('photo.jpg', 'image/jpeg', 10_000_000)])).toBe(true)
    expect(areMediaImageTypesValid([makeFile('doc.pdf', 'application/pdf')])).toBe(false)
  })

  it('detects external file drags', () => {
    expect(isExternalFileDrag({ types: ['Files'] } as unknown as DataTransfer)).toBe(true)
    expect(isExternalFileDrag({ types: ['text/plain'] } as unknown as DataTransfer)).toBe(false)
  })

  it('validates drag item types when the browser exposes them', () => {
    const accepted = canAcceptDraggedMediaFiles(
      {
        types: ['Files'],
        items: [{ kind: 'file', type: 'image/png' }],
        files: [makeFile('photo.png', 'image/png')],
      } as unknown as DataTransfer,
      5000,
    )
    const rejected = canAcceptDraggedMediaFiles(
      {
        types: ['Files'],
        items: [{ kind: 'file', type: 'application/pdf' }],
        files: [makeFile('doc.pdf', 'application/pdf')],
      } as unknown as DataTransfer,
      5000,
    )

    expect(accepted).toBe(true)
    expect(rejected).toBe(false)
  })

  it('rejects oversized drags when file sizes are exposed', () => {
    const oversized = canAcceptDraggedMediaFiles(
      {
        types: ['Files'],
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => makeFile('photo.png', 'image/png', 10_000),
          },
        ],
        files: [makeFile('photo.png', 'image/png', 10_000)],
      } as unknown as DataTransfer,
      5000,
    )

    expect(oversized).toBe(false)
  })
})
