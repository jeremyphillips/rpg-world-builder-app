import { describe, expect, it } from 'vitest'

import { resolveMessagesWorkspaceChromeVisibility } from './messages-workspace-chrome.lib'

describe('resolveMessagesWorkspaceChromeVisibility', () => {
  it('hides scope chrome on the mobile new-message route', () => {
    expect(resolveMessagesWorkspaceChromeVisibility({ isNewRoute: true })).toEqual({
      hideScopeChromeOnMobile: true,
    })
  })

  it('keeps scope chrome visible on list and thread routes', () => {
    expect(resolveMessagesWorkspaceChromeVisibility({ isNewRoute: false })).toEqual({
      hideScopeChromeOnMobile: false,
    })
  })
})
