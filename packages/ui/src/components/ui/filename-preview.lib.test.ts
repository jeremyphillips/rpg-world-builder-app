import { describe, expect, it } from 'vitest'

import {
  FILENAME_PREVIEW_MAX_COMFORTABLE,
  FILENAME_PREVIEW_MAX_COMPACT,
  FILENAME_PREVIEW_MAX_METADATA,
  prepareFilenameForDisplay,
  repairFilenameMojibake,
  splitFilename,
  truncateFilename,
} from './filename-preview.lib'

const LONG_NAME = 'seraphina-final-character-portrait.webp'

describe('prepareFilenameForDisplay', () => {
  it('repairs UTF-8 middle-dot mojibake', () => {
    const corrupted = 'DALL\u00C2\u00B7E-2024-armor-.webp'
    expect(repairFilenameMojibake(corrupted)).toBe('DALL·E-2024-armor-.webp')
    expect(prepareFilenameForDisplay(corrupted)).toBe('DALL·E-2024-armor-.webp')
  })

  it('leaves valid ASCII filenames unchanged', () => {
    expect(prepareFilenameForDisplay('seraphina-final-character-portrait.webp')).toBe(
      'seraphina-final-character-portrait.webp',
    )
  })
})

describe('splitFilename', () => {
  it('preserves dotted extensions', () => {
    expect(splitFilename(LONG_NAME)).toEqual({
      base: 'seraphina-final-character-portrait',
      extension: '.webp',
    })
  })

  it('treats names without extensions as base-only', () => {
    expect(splitFilename('README')).toEqual({ base: 'README', extension: '' })
  })
})

describe('truncateFilename', () => {
  it('returns the original filename when it fits', () => {
    expect(truncateFilename('short.png', 24)).toEqual({
      display: 'short.png',
      truncated: false,
    })
  })

  it('uses middle ellipsis while preserving the extension', () => {
    const { display, truncated } = truncateFilename(LONG_NAME, FILENAME_PREVIEW_MAX_COMFORTABLE)
    expect(truncated).toBe(true)
    expect(display).toMatch(/^seraphina-final/)
    expect(display).toContain('…')
    expect(display).toContain('-portrait.webp')
    expect(display.endsWith('.webp')).toBe(true)
  })

  it('uses a tighter head segment when space is reduced', () => {
    const comfortable = truncateFilename(LONG_NAME, FILENAME_PREVIEW_MAX_COMFORTABLE).display
    const compact = truncateFilename(LONG_NAME, FILENAME_PREVIEW_MAX_COMPACT).display
    expect(comfortable).toBe('seraphina-final-…-portrait.webp')
    expect(compact).toBe('seraphina…-portrait.webp')
    expect(compact.length).toBeLessThanOrEqual(FILENAME_PREVIEW_MAX_COMPACT)
    expect(comfortable.length).toBeLessThanOrEqual(FILENAME_PREVIEW_MAX_COMFORTABLE)
  })

  it('preserves spaced and em-dash tails with the extension', () => {
    const display = truncateFilename(
      'Seraphina Vale — portrait.jpg',
      FILENAME_PREVIEW_MAX_METADATA,
    ).display
    expect(display).toContain('.jpg')
    expect(display).toContain('…')
    expect(display).toMatch(/portrait\.jpg$/)
  })
})
