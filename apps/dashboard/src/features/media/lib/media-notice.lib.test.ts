import { describe, expect, it } from 'vitest'

import {
  hasMediaStatusNotice,
  imageAddedMediaStatusNotice,
  resolveMediaStatusNotice,
  textMediaStatusNotice,
} from './media-notice.lib'

describe('media notice helpers', () => {
  it('prefers upload notices over session notices', () => {
    expect(
      resolveMediaStatusNotice(
        'Upload limit reached.',
        imageAddedMediaStatusNotice('long-name.webp'),
      ),
    ).toEqual(textMediaStatusNotice('Upload limit reached.'))
  })

  it('detects image-added notices', () => {
    expect(hasMediaStatusNotice(imageAddedMediaStatusNotice('portrait.webp'))).toBe(true)
    expect(hasMediaStatusNotice(textMediaStatusNotice(''))).toBe(false)
    expect(hasMediaStatusNotice(null)).toBe(false)
  })
})
