import { describe, expect, it } from 'vitest'

import { resolveDisclosureDefaultOpen } from './field-group-disclosure.types'

describe('field-group disclosure', () => {
  it('defaults legend disclosure to open', () => {
    expect(resolveDisclosureDefaultOpen({ variant: 'legend' })).toBe(true)
  })

  it('defaults summary disclosure to closed', () => {
    expect(
      resolveDisclosureDefaultOpen({ variant: 'summary', resolveSummary: () => ({ primary: '' }) }),
    ).toBe(false)
  })

  it('honors explicit defaultOpen', () => {
    expect(resolveDisclosureDefaultOpen({ variant: 'legend', defaultOpen: false })).toBe(false)
    expect(
      resolveDisclosureDefaultOpen({
        variant: 'summary',
        defaultOpen: true,
        resolveSummary: () => ({ primary: '' }),
      }),
    ).toBe(true)
  })
})
