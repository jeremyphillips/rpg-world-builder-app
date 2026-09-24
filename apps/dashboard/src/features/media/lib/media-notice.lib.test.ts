import { describe, expect, it } from 'vitest'

import {
  hasMediaStatusNotice,
  resolveMediaStatusNotice,
  textMediaStatusNotice,
} from './media-notice.lib'

describe('media notice helpers', () => {
  it('prefers upload notices over session notices', () => {
    expect(
      resolveMediaStatusNotice('Upload limit reached.', textMediaStatusNotice('Image removed.')),
    ).toEqual(textMediaStatusNotice('Upload limit reached.'))
  })

  it('detects non-empty text notices', () => {
    expect(hasMediaStatusNotice(textMediaStatusNotice('Upload complete.'))).toBe(true)
    expect(hasMediaStatusNotice(textMediaStatusNotice(''))).toBe(false)
    expect(hasMediaStatusNotice(null)).toBe(false)
  })
})
