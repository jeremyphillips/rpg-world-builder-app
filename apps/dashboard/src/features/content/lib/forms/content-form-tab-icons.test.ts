import { describe, expect, it } from 'vitest'

import {
  CONTENT_FORM_TAB_ICONS,
  contentFormTabLeadingIcon,
  withContentFormTabIcon,
} from './content-form-tab-icons'

describe('content-form-tab-icons', () => {
  it('returns a leading icon for every mapped tab id', () => {
    for (const tabId of Object.keys(CONTENT_FORM_TAB_ICONS)) {
      expect(contentFormTabLeadingIcon(tabId)).toBeTruthy()
    }
  })

  it('returns undefined for unknown tab ids', () => {
    expect(contentFormTabLeadingIcon('unknown')).toBeUndefined()
  })

  it('attaches a leading icon onto a tab definition', () => {
    const tab = withContentFormTabIcon({
      id: 'basics',
      label: 'Basics',
      fields: [],
    })
    expect(tab.leadingIcon).toBeTruthy()
  })
})
