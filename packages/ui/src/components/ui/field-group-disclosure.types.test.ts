import { describe, expect, it } from 'vitest'

import { resolveDisclosureDefaultOpen } from './field-group-disclosure.types'

describe('field-group disclosure', () => {
  it('defaults legend disclosure to open', () => {
    expect(resolveDisclosureDefaultOpen({ variant: 'legend' })).toBe(true)
  })

  it('defaults inline and dialog disclosure to closed', () => {
    expect(
      resolveDisclosureDefaultOpen({ variant: 'inline', resolveSummary: () => ({ primary: '' }) }),
    ).toBe(false)
    expect(
      resolveDisclosureDefaultOpen({ variant: 'dialog', resolveSummary: () => ({ primary: '' }) }),
    ).toBe(false)
  })

  it('honors explicit defaultOpen', () => {
    expect(resolveDisclosureDefaultOpen({ variant: 'legend', defaultOpen: false })).toBe(false)
    expect(
      resolveDisclosureDefaultOpen({
        variant: 'inline',
        defaultOpen: true,
        resolveSummary: () => ({ primary: '' }),
      }),
    ).toBe(true)
  })
})
