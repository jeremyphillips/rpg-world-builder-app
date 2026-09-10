import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { ScrollReveal } from './scroll-reveal.client'

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
}

function getWrapper() {
  // The reveal wrapper is the element directly containing the text child.
  return screen.getByText('Reveal me')
}

describe('ScrollReveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders content visible before hydration effects run', () => {
    mockMatchMedia(false)

    render(<ScrollReveal>Reveal me</ScrollReveal>)

    // Without IntersectionObserver (jsdom default) the component reveals
    // immediately instead of hiding content.
    expect(getWrapper()).toHaveAttribute('data-reveal', 'revealed')
  })

  it('reveals immediately when the user prefers reduced motion', () => {
    mockMatchMedia(true)
    vi.stubGlobal('IntersectionObserver', vi.fn())

    render(<ScrollReveal>Reveal me</ScrollReveal>)

    expect(getWrapper()).toHaveAttribute('data-reveal', 'revealed')
  })

  describe('with IntersectionObserver available', () => {
    let observe: ReturnType<typeof vi.fn>
    let disconnect: ReturnType<typeof vi.fn>
    let intersect: ObserverCallback

    beforeEach(() => {
      mockMatchMedia(false)
      observe = vi.fn()
      disconnect = vi.fn()

      class MockIntersectionObserver {
        observe: typeof observe
        disconnect: typeof disconnect

        constructor(callback: ObserverCallback) {
          intersect = callback
          this.observe = observe
          this.disconnect = disconnect
        }
      }

      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    })

    it('hides below-the-fold content, then reveals it on intersection', async () => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        top: window.innerHeight + 500,
      } as DOMRect)

      render(<ScrollReveal>Reveal me</ScrollReveal>)

      expect(getWrapper()).toHaveAttribute('data-reveal', 'hidden')
      expect(observe).toHaveBeenCalledWith(getWrapper())

      intersect([{ isIntersecting: true }])

      await waitFor(() => {
        expect(getWrapper()).toHaveAttribute('data-reveal', 'revealed')
      })
      expect(disconnect).toHaveBeenCalled()
    })

    it('keeps above-the-fold content visible without observing', () => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 0,
      } as DOMRect)

      render(<ScrollReveal>Reveal me</ScrollReveal>)

      expect(getWrapper()).toHaveAttribute('data-reveal', 'revealed')
      expect(observe).not.toHaveBeenCalled()
    })

    it('applies a stagger delay when provided', () => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 0,
      } as DOMRect)

      render(<ScrollReveal delayMs={150}>Reveal me</ScrollReveal>)

      expect(getWrapper().style.transitionDelay).toBe('150ms')
    })
  })
})
