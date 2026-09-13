import { describe, expect, it } from 'vitest'

import { isElementOutsideScrollport } from './is-element-outside-scrollport'

describe('isElementOutsideScrollport', () => {
  it('returns false when the element is fully inside the scrollport', () => {
    const scrollport = { getBoundingClientRect: () => ({ top: 0, bottom: 100 }) }
    const element = { getBoundingClientRect: () => ({ top: 10, bottom: 40 }) }

    expect(isElementOutsideScrollport(element as Element, scrollport as Element)).toBe(false)
  })

  it('returns true when the element extends above the scrollport', () => {
    const scrollport = { getBoundingClientRect: () => ({ top: 20, bottom: 100 }) }
    const element = { getBoundingClientRect: () => ({ top: 10, bottom: 40 }) }

    expect(isElementOutsideScrollport(element as Element, scrollport as Element)).toBe(true)
  })

  it('returns true when the element extends below the scrollport', () => {
    const scrollport = { getBoundingClientRect: () => ({ top: 0, bottom: 100 }) }
    const element = { getBoundingClientRect: () => ({ top: 80, bottom: 120 }) }

    expect(isElementOutsideScrollport(element as Element, scrollport as Element)).toBe(true)
  })
})
