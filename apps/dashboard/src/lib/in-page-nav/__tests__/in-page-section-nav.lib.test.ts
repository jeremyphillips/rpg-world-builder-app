/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'

import { scrollToInPageNavAnchor } from '../in-page-section-nav.lib'

describe('scrollToInPageNavAnchor', () => {
  it('scrolls a nested scrollport instead of the window', () => {
    const scrollport = document.createElement('div')
    scrollport.style.overflowY = 'auto'
    Object.defineProperty(scrollport, 'scrollHeight', { value: 800, configurable: true })
    Object.defineProperty(scrollport, 'clientHeight', { value: 200, configurable: true })
    scrollport.scrollTo = vi.fn()

    const anchor = document.createElement('div')
    anchor.id = 'traits-heading'
    anchor.getBoundingClientRect = () =>
      ({
        top: 120,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 120,
        toJSON: () => ({}),
      }) as DOMRect
    scrollport.getBoundingClientRect = () =>
      ({
        top: 40,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 40,
        toJSON: () => ({}),
      }) as DOMRect
    Object.defineProperty(scrollport, 'scrollTop', {
      value: 10,
      configurable: true,
      writable: true,
    })

    scrollport.append(anchor)
    document.body.append(scrollport)

    const windowScrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)

    scrollToInPageNavAnchor('traits-heading')

    expect(scrollport.scrollTo).toHaveBeenCalledWith({ top: 58, behavior: 'smooth' })
    expect(windowScrollTo).not.toHaveBeenCalled()

    windowScrollTo.mockRestore()
    scrollport.remove()
  })
})
