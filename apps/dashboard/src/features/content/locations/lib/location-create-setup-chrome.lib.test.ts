import { describe, expect, it } from 'vitest'

import { resolveLocationCreateSetupDefaultSubhead } from './location-create-setup-chrome.lib'

describe('resolveLocationCreateSetupDefaultSubhead', () => {
  it('derives the generic subhead from the contextual noun', () => {
    expect(resolveLocationCreateSetupDefaultSubhead('Settlement')).toBe(
      'Choose the options that best describe this settlement.',
    )
    expect(resolveLocationCreateSetupDefaultSubhead('site')).toBe(
      'Choose the options that best describe this site.',
    )
    expect(resolveLocationCreateSetupDefaultSubhead('Subregion')).toBe(
      'Choose the options that best describe this subregion.',
    )
  })
})
