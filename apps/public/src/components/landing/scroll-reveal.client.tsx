'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

import { cn } from '@rpg/ui'

import { scrollRevealVariants, type ScrollRevealVariantProps } from './scroll-reveal.variants'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
/** Start the reveal slightly before the element fully enters the viewport. */
const REVEAL_ROOT_MARGIN = '0px 0px -48px 0px'

export interface ScrollRevealProps extends ScrollRevealVariantProps {
  children: ReactNode
  className?: string
  /** Transition delay in milliseconds, for staggering sibling reveals. */
  delayMs?: number
}

/**
 * Reveals its children with a fade/rise transition when scrolled into view.
 *
 * Progressive enhancement: the server renders content visible, and it stays
 * visible for no-JS visitors, above-the-fold content, and anyone who prefers
 * reduced motion. Only below-the-fold content is hidden (after hydration,
 * while still off-screen) and transitioned in via IntersectionObserver.
 *
 * The `data-reveal` attribute is presentational only, so it is driven
 * imperatively on the DOM node — no state, no re-renders.
 */
export function ScrollReveal({ children, className, delayMs = 0, direction }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia(REDUCED_MOTION_QUERY).matches
    ) {
      node.dataset.reveal = 'revealed'
      return
    }

    // Content already in (or above) the viewport stays visible — hiding it
    // after first paint would flash. Only below-the-fold content animates.
    if (node.getBoundingClientRect().top < window.innerHeight) {
      node.dataset.reveal = 'revealed'
      return
    }

    node.dataset.reveal = 'hidden'
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.dataset.reveal = 'revealed'
          observer.disconnect()
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const style: CSSProperties | undefined =
    delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined

  return (
    <div
      ref={ref}
      data-reveal="initial"
      style={style}
      className={cn(scrollRevealVariants({ direction }), className)}
    >
      {children}
    </div>
  )
}
