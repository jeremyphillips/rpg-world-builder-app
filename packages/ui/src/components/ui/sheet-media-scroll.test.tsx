import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { Sheet } from './sheet.client'
import { computeSheetStickyHeaderStuck } from './sheet-sticky-header-boundary.lib'

function mockScrollMetrics(
  element: HTMLElement,
  {
    scrollTop,
    scrollHeight,
    clientHeight,
  }: {
    scrollTop: number
    scrollHeight: number
    clientHeight: number
  },
) {
  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    value: scrollTop,
    writable: true,
  })
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  })
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  })
}

describe('Sheet.MediaScroll', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver

  beforeEach(() => {
    globalThis.IntersectionObserver = vi.fn(function MockIntersectionObserver(
      this: IntersectionObserver,
      callback: IntersectionObserverCallback,
    ) {
      this.observe = vi.fn()
      this.unobserve = vi.fn()
      this.disconnect = vi.fn()
      ;(
        this as IntersectionObserver & { trigger: (entry: IntersectionObserverEntry) => void }
      ).trigger = (entry) => callback([entry], this)
      return this
    }) as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    globalThis.IntersectionObserver = originalIntersectionObserver
  })

  it('renders media, sticky header shell, and body inside one scrollport', () => {
    render(
      <Sheet.Root defaultOpen>
        <Sheet.Content hasMedia>
          <Sheet.MediaScroll
            media={<img data-testid="hero-image" src="/dwarf.jpeg" alt="" />}
            header={<Sheet.Header headline="Dwarf" />}
          >
            <p>Body content</p>
          </Sheet.MediaScroll>
        </Sheet.Content>
      </Sheet.Root>,
    )

    const dialog = screen.getByRole('dialog')
    const hero = screen.getByTestId('hero-image')
    const stickyShell = screen.getByTestId('sheet-sticky-header-shell')
    const scrollport = hero.closest('.overflow-y-auto')

    expect(dialog).toHaveAttribute('data-has-media', 'true')
    expect(scrollport).toContainElement(hero)
    expect(scrollport).toContainElement(stickyShell)
    expect(stickyShell).toHaveClass('sticky', 'top-0', 'border-b')
    expect(
      screen.getByRole('heading', { name: 'Dwarf' }).closest('.border-b-0'),
    ).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('z-30')
  })

  it('marks the sticky header shell as stuck when the sentinel crosses the boundary', () => {
    let trigger: ((entry: IntersectionObserverEntry) => void) | undefined

    globalThis.IntersectionObserver = vi.fn(function MockIntersectionObserver(
      this: IntersectionObserver,
      callback: IntersectionObserverCallback,
    ) {
      trigger = (entry) => callback([entry], this)
      this.observe = vi.fn()
      this.unobserve = vi.fn()
      this.disconnect = vi.fn()
      return this
    }) as unknown as typeof IntersectionObserver

    render(
      <Sheet.Root defaultOpen>
        <Sheet.Content hasMedia>
          <Sheet.MediaScroll
            media={<img data-testid="hero-image" src="/dwarf.jpeg" alt="" />}
            header={<Sheet.Header headline="Dwarf" />}
          >
            <p>Body content</p>
          </Sheet.MediaScroll>
        </Sheet.Content>
      </Sheet.Root>,
    )

    const stickyShell = screen.getByTestId('sheet-sticky-header-shell')
    expect(stickyShell).not.toHaveAttribute('data-stuck')

    act(() => {
      trigger?.({
        isIntersecting: false,
        boundingClientRect: { top: -1 } as DOMRectReadOnly,
        rootBounds: { top: 0 } as DOMRectReadOnly,
      } as IntersectionObserverEntry)
    })

    expect(stickyShell).toHaveAttribute('data-stuck', 'true')
    expect(
      computeSheetStickyHeaderStuck({
        isIntersecting: false,
        boundingClientRect: { top: -1 } as DOMRectReadOnly,
        rootBounds: { top: 0 } as DOMRectReadOnly,
      } as IntersectionObserverEntry),
    ).toBe(true)
  })

  it('does not render a viewport-top boundary shadow', () => {
    render(
      <Sheet.Root defaultOpen>
        <Sheet.Content hasMedia>
          <Sheet.MediaScroll
            media={<img data-testid="hero-image" src="/dwarf.jpeg" alt="" />}
            header={<Sheet.Header headline="Dwarf" />}
          >
            <p>Body content</p>
          </Sheet.MediaScroll>
        </Sheet.Content>
      </Sheet.Root>,
    )

    const root = screen.getByTestId('hero-image').closest('.relative')
    expect(root?.querySelector('.bg-gradient-to-b.top-0')).not.toBeInTheDocument()
    expect(screen.getByTestId('sheet-sticky-header-boundary-shadow')).toHaveClass('top-full')
    expect(screen.getByTestId('sheet-sticky-header-shell')).toHaveClass('border-b')
  })

  it('shows a header-bottom boundary shadow when stuck and scrolled', () => {
    let trigger: ((entry: IntersectionObserverEntry) => void) | undefined

    globalThis.IntersectionObserver = vi.fn(function MockIntersectionObserver(
      this: IntersectionObserver,
      callback: IntersectionObserverCallback,
    ) {
      trigger = (entry) => callback([entry], this)
      this.observe = vi.fn()
      this.unobserve = vi.fn()
      this.disconnect = vi.fn()
      return this
    }) as unknown as typeof IntersectionObserver

    render(
      <Sheet.Root defaultOpen>
        <Sheet.Content hasMedia>
          <Sheet.MediaScroll
            media={<div data-testid="hero-image" style={{ height: 240 }} />}
            header={<Sheet.Header headline="Dwarf" />}
          >
            {Array.from({ length: 20 }, (_, index) => (
              <p key={index}>Body line {index + 1}</p>
            ))}
          </Sheet.MediaScroll>
        </Sheet.Content>
      </Sheet.Root>,
    )

    const viewport = screen.getByTestId('hero-image').closest('.overflow-y-auto') as HTMLElement
    const headerShadow = screen.getByTestId('sheet-sticky-header-boundary-shadow')

    mockScrollMetrics(viewport, { scrollTop: 0, scrollHeight: 1200, clientHeight: 400 })
    act(() => {
      fireEvent.scroll(viewport)
    })
    act(() => {
      trigger?.({
        isIntersecting: false,
        boundingClientRect: { top: -1 } as DOMRectReadOnly,
        rootBounds: { top: 0 } as DOMRectReadOnly,
      } as IntersectionObserverEntry)
    })

    expect(headerShadow).toHaveAttribute('data-visible', 'false')

    mockScrollMetrics(viewport, { scrollTop: 120, scrollHeight: 1200, clientHeight: 400 })
    act(() => {
      fireEvent.scroll(viewport)
    })

    expect(headerShadow).toHaveAttribute('data-visible', 'true')
  })

  it('shows a bottom boundary shadow when content continues below the viewport', () => {
    render(
      <Sheet.Root defaultOpen>
        <Sheet.Content hasMedia>
          <Sheet.MediaScroll
            media={<div data-testid="hero-image" style={{ height: 120 }} />}
            header={<Sheet.Header headline="Dwarf" />}
          >
            {Array.from({ length: 20 }, (_, index) => (
              <p key={index}>Body line {index + 1}</p>
            ))}
          </Sheet.MediaScroll>
        </Sheet.Content>
      </Sheet.Root>,
    )

    const viewport = screen.getByTestId('hero-image').closest('.overflow-y-auto') as HTMLElement
    const bottomShadow = screen.getByTestId('sheet-media-scroll-bottom-shadow')

    mockScrollMetrics(viewport, { scrollTop: 0, scrollHeight: 1200, clientHeight: 400 })
    act(() => {
      fireEvent.scroll(viewport)
    })

    expect(bottomShadow).toHaveAttribute('data-visible', 'true')

    mockScrollMetrics(viewport, { scrollTop: 800, scrollHeight: 1200, clientHeight: 400 })
    act(() => {
      fireEvent.scroll(viewport)
    })

    expect(bottomShadow).toHaveAttribute('data-visible', 'false')
  })
})
