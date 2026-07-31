import { describe, expect, it } from 'vitest'

import { resolveMessagesWorkspaceChromeVisibility } from './messages-workspace-chrome.lib'

describe('resolveMessagesWorkspaceChromeVisibility', () => {
  it('hides redundant chrome on the mobile new-message route', () => {
    expect(resolveMessagesWorkspaceChromeVisibility({ isNewRoute: true })).toEqual({
      hideNewMessageActionOnMobile: true,
      hideScopeChromeOnMobile: true,
    })
  })

  it('keeps chrome visible on list and thread routes', () => {
    expect(resolveMessagesWorkspaceChromeVisibility({ isNewRoute: false })).toEqual({
      hideNewMessageActionOnMobile: false,
      hideScopeChromeOnMobile: false,
    })
  })
})
