'use client'

import { cn } from '../../lib/utils'
import { ContentCardBody, type ContentCardBodyProps } from './content-card-body.client'
import {
  contentCardRootVariants,
  type ContentCardChrome,
  type ContentCardDensity,
  type ContentCardSurface,
} from './content-card.variants'

function resolveContentCardChrome(
  chrome: ContentCardChrome | undefined,
  surface: ContentCardSurface | undefined,
): ContentCardChrome {
  if (chrome) return chrome
  if (surface === 'ghost') return 'embedded'
  return 'standalone'
}

export type ContentCardProps = Omit<ContentCardBodyProps, 'rowAlign' | 'className'> & {
  density?: ContentCardDensity
  /** Who draws the outer shell — card (`standalone`) or host (`embedded`). */
  chrome?: ContentCardChrome
  /** @deprecated Use `chrome` — `outline`/`card` → `standalone`, `ghost` → `embedded`. */
  surface?: ContentCardSurface
  className?: string
  'data-disabled'?: boolean
}

// Future variants should be added only when demonstrated by a real ContentCard consumer.
export function ContentCard({
  heading,
  headingSuffix,
  subheading,
  metadata,
  media,
  headingEndSlot,
  endSlot,
  footer,
  density = 'comfortable',
  chrome,
  surface,
  className,
  'data-disabled': dataDisabled,
}: ContentCardProps) {
  const hasSecondaryText = Boolean(subheading || metadata)
  const rowAlign = hasSecondaryText ? 'start' : 'center'
  const resolvedChrome = resolveContentCardChrome(chrome, surface)
  const filledSurface = surface === 'card' ? 'bg-card' : undefined

  return (
    <article
      className={cn(
        contentCardRootVariants({ density, chrome: resolvedChrome }),
        filledSurface,
        className,
      )}
      data-disabled={dataDisabled}
    >
      <ContentCardBody
        heading={heading}
        headingSuffix={headingSuffix}
        subheading={subheading}
        metadata={metadata}
        media={media}
        headingEndSlot={headingEndSlot}
        endSlot={endSlot}
        footer={footer}
        density={density}
        rowAlign={rowAlign}
      />
    </article>
  )
}
