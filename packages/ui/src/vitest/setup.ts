import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom lacks ResizeObserver, which Radix primitives (via useSize) rely on.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
}

// jsdom lacks IntersectionObserver, used by Sheet.MediaScroll sticky headers.
if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = class implements IntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin = '0px'
    readonly scrollMargin = '0px'
    readonly thresholds: readonly number[] = [0]

    constructor(_callback: IntersectionObserverCallback) {}

    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

afterEach(() => {
  cleanup()
})
