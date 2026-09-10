import type { ReactNode } from 'react'

import { cn, Eyebrow, Heading, Text } from '@rpg/ui'

import {
  landingSectionHeaderClasses,
  landingSectionInnerClasses,
  landingSectionVariants,
  type LandingSectionVariantProps,
} from './landing-section.variants'
import { ScrollReveal } from './scroll-reveal.client'

export interface LandingSectionProps extends LandingSectionVariantProps {
  /** Section anchor id; also derives the heading id for `aria-labelledby`. */
  id: string
  eyebrow: string
  heading: string
  description?: string
  children: ReactNode
  className?: string
}

/**
 * Shared shell for landing page sections: consistent rhythm, an animated
 * eyebrow/heading/lead header, and an `aria-labelledby` landmark per section.
 */
export function LandingSection({
  id,
  eyebrow,
  heading,
  description,
  surface,
  children,
  className,
}: LandingSectionProps) {
  const headingId = `${id}-heading`
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(landingSectionVariants({ surface }), className)}
    >
      <div className={landingSectionInnerClasses}>
        <ScrollReveal className={landingSectionHeaderClasses}>
          <Eyebrow tone="primary">{eyebrow}</Eyebrow>
          <Heading variant="section" as="h2" id={headingId} className="text-balance">
            {heading}
          </Heading>
          {description ? (
            <Text variant="lead" as="p" className="text-pretty">
              {description}
            </Text>
          ) : null}
        </ScrollReveal>
        {children}
      </div>
    </section>
  )
}
